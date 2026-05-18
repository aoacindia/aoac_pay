"use server";

import { verifyPaymentToken } from "@/lib/security/jwt";
import {
  getOrderPaymentView,
  isOrderAlreadyPaid,
} from "@/lib/orders/queries";

export async function verifyPaymentLinkStep(
  token: string,
): Promise<{ ok: true } | { ok: false }> {
  if (!token?.trim()) {
    return { ok: false };
  }

  try {
    await verifyPaymentToken(token.trim());
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export type PayPageReadyResult = {
  type: "ready";
  token: string;
  view: NonNullable<Awaited<ReturnType<typeof getOrderPaymentView>>>;
};

export type PayPageLoadResult =
  | { type: "not_found" }
  | { type: "already_paid" }
  | PayPageReadyResult;

export async function loadPaymentDetailsStep(
  token: string,
): Promise<PayPageLoadResult> {
  const payload = await verifyPaymentToken(token.trim());
  const view = await getOrderPaymentView(payload.orderId);

  if (!view) {
    return { type: "not_found" };
  }

  if (isOrderAlreadyPaid(view.order.status) || !view.canPay) {
    return { type: "already_paid" };
  }

  return { type: "ready", token: token.trim(), view };
}
