"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getUsersDb } from "@/lib/db";
import { orders, PAYABLE_ORDER_STATUSES } from "@/drizzle/users/schema";
import { verifyPaymentToken } from "@/lib/security/jwt";
import { rateLimit } from "@/lib/security/rate-limit";
import { getRazorpay } from "@/lib/razorpay/client";
import { calculatePendingAmount, toPaise } from "@/lib/orders/calculations";
import { getOrderPaymentView } from "@/lib/orders/queries";
import { completeOrderPayment } from "@/lib/payments/complete";
import { verifyPaymentSignature } from "@/lib/razorpay/verify";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import type {
  CreateRazorpayOrderResult,
  VerifyPaymentResult,
} from "@/types/payment";

const createOrderSchema = z.object({
  token: z.string().min(10),
});

const verifySchema = z.object({
  token: z.string().min(10),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function createRazorpayOrder(
  input: z.infer<typeof createOrderSchema>,
): Promise<CreateRazorpayOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request" };
  }

  const limited = await rateLimit(`create-order:${parsed.data.token.slice(0, 32)}`);
  if (!limited.success) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  try {
    const payload = await verifyPaymentToken(parsed.data.token);
    const view = await getOrderPaymentView(payload.orderId);

    if (!view) {
      return { success: false, error: "Order not found" };
    }

    if (!view.canPay) {
      return { success: false, error: "This order cannot accept payment." };
    }

    const usersDb = getUsersDb();
    const [order] = await usersDb
      .select({
        id: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        paidAmount: orders.paidAmount,
        discountAmount: orders.discountAmount,
        rOrderId: orders.rOrderId,
      })
      .from(orders)
      .where(eq(orders.id, payload.orderId))
      .limit(1);

    if (!order || !PAYABLE_ORDER_STATUSES.includes(order.status)) {
      return { success: false, error: "Order is not payable" };
    }

    const pendingAmount = calculatePendingAmount({
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      discountAmount: order.discountAmount,
    });

    if (pendingAmount <= 0) {
      return { success: false, error: "No pending amount" };
    }

    const amountPaise = toPaise(pendingAmount);
    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `order_${order.id}`,
      notes: {
        orderId: order.id,
        userId: view.customer.id,
      },
    });

    await usersDb
      .update(orders)
      .set({ rOrderId: razorpayOrder.id })
      .where(eq(orders.id, order.id));

    const { razorpayKeyId } = getPublicEnv();

    return {
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      keyId: razorpayKeyId,
      orderId: order.id,
      userId: view.customer.id,
      customerName: view.customer.name,
      customerEmail: view.customer.email,
      customerPhone: view.customer.phone,
    };
  } catch {
    return { success: false, error: "Unable to initiate payment" };
  }
}

export async function verifyAndCompletePayment(
  input: z.infer<typeof verifySchema>,
): Promise<VerifyPaymentResult> {
  const parsed = verifySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request" };
  }

  const limited = await rateLimit(
    `verify:${parsed.data.razorpayPaymentId}`,
    { limit: 5, windowMs: 60_000 },
  );
  if (!limited.success) {
    return { success: false, error: "Too many requests" };
  }

  const isValid = verifyPaymentSignature({
    razorpayOrderId: parsed.data.razorpayOrderId,
    razorpayPaymentId: parsed.data.razorpayPaymentId,
    razorpaySignature: parsed.data.razorpaySignature,
  });

  if (!isValid) {
    return { success: false, error: "Payment verification failed" };
  }

  try {
    const payload = await verifyPaymentToken(parsed.data.token);
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(
      parsed.data.razorpayPaymentId,
    );

    if (payment.order_id !== parsed.data.razorpayOrderId) {
      return { success: false, error: "Payment order mismatch" };
    }

    const notes = payment.notes as Record<string, string> | null;
    if (notes?.orderId && notes.orderId !== payload.orderId) {
      return { success: false, error: "Order mismatch" };
    }

    const usersDb = getUsersDb();
    const result = await completeOrderPayment(usersDb, {
      orderId: payload.orderId,
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      amountPaise: Number(payment.amount),
      paymentMethod: payment.method ?? null,
      paymentVpa:
        typeof payment.vpa === "string"
          ? payment.vpa
          : (payment.acquirer_data as { vpa?: string } | undefined)?.vpa ?? null,
    });

    if (!result.ok) {
      return { success: false, error: result.reason };
    }

    getServerEnv();
    return {
      success: true,
      message: result.alreadyProcessed
        ? "Payment already recorded"
        : "Payment successful",
    };
  } catch {
    return { success: false, error: "Payment processing failed" };
  }
}
