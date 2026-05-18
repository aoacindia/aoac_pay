import { eq } from "drizzle-orm";
import type { UsersDatabase } from "@/lib/db";
import {
  orders,
  PAYABLE_ORDER_STATUSES,
  type OrderStatus,
} from "@/drizzle/users/schema";
import { calculatePendingAmount } from "@/lib/orders/calculations";
import { convertProformaToTaxInvoiceTx } from "@/lib/invoice/convert";

export type PaymentCompletionInput = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaise: number;
  paymentMethod?: string | null;
  paymentVpa?: string | null;
};

export type PaymentCompletionResult =
  | { ok: true; alreadyProcessed: boolean }
  | { ok: false; reason: string };

function resolveStatusAfterPayment(
  currentStatus: OrderStatus,
  isFullyPaid: boolean,
): OrderStatus {
  if (!isFullyPaid) {
    return currentStatus === "ORDER_SHIPPED_WITHOUT_PAYMENT"
      ? "ORDER_SHIPPED_WITHOUT_PAYMENT"
      : "PAYMENT_PENDING";
  }

  if (currentStatus === "ORDER_SHIPPED_WITHOUT_PAYMENT") {
    return "ORDER_SHIPPED_WITHOUT_PAYMENT";
  }

  return "PAID";
}

export async function completeOrderPayment(
  db: UsersDatabase,
  input: PaymentCompletionInput,
): Promise<PaymentCompletionResult> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, input.orderId))
      .for("update");

    if (!order) {
      return { ok: false, reason: "Order not found" };
    }

    if (
      order.rPaymentId === input.razorpayPaymentId &&
      order.rOrderId === input.razorpayOrderId
    ) {
      return { ok: true, alreadyProcessed: true };
    }

    if (!PAYABLE_ORDER_STATUSES.includes(order.status)) {
      return { ok: false, reason: "Order is not payable" };
    }

    const pendingBefore = calculatePendingAmount({
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      discountAmount: order.discountAmount,
    });

    const paidPaise = input.amountPaise;
    const pendingPaise = Math.round(pendingBefore * 100);

    if (paidPaise < pendingPaise) {
      const amountPaidRupees = paidPaise / 100;
      const newPaidAmount = (order.paidAmount ?? 0) + amountPaidRupees;

      await tx
        .update(orders)
        .set({
          paidAmount: newPaidAmount,
          rOrderId: input.razorpayOrderId,
          rPaymentId: input.razorpayPaymentId,
          paymentMethod: input.paymentMethod ?? order.paymentMethod,
          paymentVpa: input.paymentVpa ?? order.paymentVpa,
          status: resolveStatusAfterPayment(order.status, false),
        })
        .where(eq(orders.id, input.orderId));

      return { ok: true, alreadyProcessed: false };
    }

    if (paidPaise > pendingPaise) {
      return { ok: false, reason: "Payment amount exceeds pending balance" };
    }

    const newPaidAmount = order.totalAmount;
    const newStatus = resolveStatusAfterPayment(order.status, true);

    await tx
      .update(orders)
      .set({
        paidAmount: newPaidAmount,
        rOrderId: input.razorpayOrderId,
        rPaymentId: input.razorpayPaymentId,
        paymentMethod: input.paymentMethod ?? order.paymentMethod,
        paymentVpa: input.paymentVpa ?? order.paymentVpa,
        status: newStatus,
      })
      .where(eq(orders.id, input.orderId));

    if (order.invoiceType === "PI" && newStatus === "PAID") {
      await convertProformaToTaxInvoiceTx(tx, input.orderId);
    }

    return { ok: true, alreadyProcessed: false };
  });
}
