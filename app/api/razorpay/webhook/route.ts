import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUsersDb } from "@/lib/db";
import { orders } from "@/drizzle/users/schema";
import { verifyWebhookSignature } from "@/lib/razorpay/verify";
import { completeOrderPayment } from "@/lib/payments/complete";
import { rateLimit } from "@/lib/security/rate-limit";
import { getRazorpay } from "@/lib/razorpay/client";
import { z } from "zod";

export const runtime = "nodejs";

const webhookEventSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          order_id: z.string().nullable(),
          amount: z.number(),
          status: z.string(),
          method: z.string().optional(),
          vpa: z.string().optional().nullable(),
          notes: z.record(z.string(), z.string()).optional().nullable(),
        }),
      })
      .optional(),
  }),
});

const processedEvents = new Set<string>();

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const limited = await rateLimit("webhook:global", { limit: 100, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = webhookEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ received: true });
  }

  const { event, payload } = parsed.data;

  if (event !== "payment.captured" && event !== "order.paid") {
    return NextResponse.json({ received: true });
  }

  const paymentEntity = payload.payment?.entity;
  if (!paymentEntity || paymentEntity.status !== "captured") {
    return NextResponse.json({ received: true });
  }

  const eventKey = `${event}:${paymentEntity.id}`;
  if (processedEvents.has(eventKey)) {
    return NextResponse.json({ received: true });
  }
  processedEvents.add(eventKey);

  const orderId = paymentEntity.notes?.orderId;
  const razorpayOrderId = paymentEntity.order_id;

  if (!orderId || !razorpayOrderId) {
    return NextResponse.json({ received: true });
  }

  try {
    const usersDb = getUsersDb();
    const [order] = await usersDb
      .select({ id: orders.id, rOrderId: orders.rOrderId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ received: true });
    }

    if (order.rOrderId && order.rOrderId !== razorpayOrderId) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(paymentEntity.id);

    if (payment.order_id !== razorpayOrderId) {
      return NextResponse.json({ error: "Payment mismatch" }, { status: 400 });
    }

    const result = await completeOrderPayment(usersDb, {
      orderId,
      razorpayOrderId,
      razorpayPaymentId: paymentEntity.id,
      amountPaise: Number(payment.amount),
      paymentMethod: payment.method ?? null,
      paymentVpa:
        typeof payment.vpa === "string"
          ? payment.vpa
          : (payment.acquirer_data as { vpa?: string } | undefined)?.vpa ?? null,
    });

    if (!result.ok) {
      console.warn("[webhook] payment not applied:", result.reason);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook]", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
