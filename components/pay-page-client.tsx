"use client";

import { useEffect, useState } from "react";
import {
  verifyPaymentLinkStep,
  loadPaymentDetailsStep,
  type PayPageLoadResult,
} from "@/actions/pay-page";
import { OrderSummary } from "@/components/order-summary";
import { PayButton } from "@/components/pay-button";
import { PayShell } from "@/components/pay-shell";
import { PaymentLoading } from "@/components/payment-loading";
import { PaymentStatus } from "@/components/payment-status";

const LOADING_MESSAGES = {
  open: "Opening secure payment…",
  verify: "Verifying your payment link…",
  load: "Loading your order summary…",
  prepare: "Preparing checkout…",
} as const;

type PayPageClientProps = {
  token: string | null;
};

type PageState =
  | { phase: "loading"; message: string }
  | { phase: "missing_token" }
  | { phase: "invalid_link" }
  | { phase: "not_found" }
  | { phase: "already_paid" }
  | {
      phase: "ready";
      token: string;
      view: Extract<PayPageLoadResult, { type: "ready" }>["view"];
    };

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 80);
    });
  });
}

export function PayPageClient({ token }: PayPageClientProps) {
  const [state, setState] = useState<PageState>({
    phase: "loading",
    message: LOADING_MESSAGES.open,
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        setState({ phase: "missing_token" });
        return;
      }

      setState({ phase: "loading", message: LOADING_MESSAGES.open });
      await waitForPaint();
      if (cancelled) return;

      setState({ phase: "loading", message: LOADING_MESSAGES.verify });
      const verified = await verifyPaymentLinkStep(token);
      if (cancelled) return;

      if (!verified.ok) {
        setState({ phase: "invalid_link" });
        return;
      }

      setState({ phase: "loading", message: LOADING_MESSAGES.load });
      await waitForPaint();
      if (cancelled) return;

      setState({ phase: "loading", message: LOADING_MESSAGES.prepare });
      const result = await loadPaymentDetailsStep(token);
      if (cancelled) return;

      if (result.type === "not_found") {
        setState({ phase: "not_found" });
        return;
      }

      if (result.type === "already_paid") {
        setState({ phase: "already_paid" });
        return;
      }

      setState({ phase: "ready", token: result.token, view: result.view });
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.phase === "loading") {
    return (
      <PayShell showHeader={false}>
        <PaymentLoading message={state.message} />
      </PayShell>
    );
  }

  if (state.phase === "missing_token") {
    return (
      <PayShell>
        <PaymentStatus variant="invalid" message="Invalid payment link." />
      </PayShell>
    );
  }

  if (state.phase === "invalid_link") {
    return (
      <PayShell>
        <PaymentStatus
          variant="error"
          message="This payment link is invalid or has expired."
        />
      </PayShell>
    );
  }

  if (state.phase === "not_found") {
    return (
      <PayShell>
        <PaymentStatus
          variant="error"
          message="We could not find this order. Please contact support."
        />
      </PayShell>
    );
  }

  if (state.phase === "already_paid") {
    return (
      <PayShell>
        <PaymentStatus
          variant="paid"
          message="This order has already been paid."
        />
      </PayShell>
    );
  }

  return (
    <PayShell>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <OrderSummary view={state.view} />

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-[#168e2d]/20 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#2d5a36]">
              Your amount is calculated securely on our servers. Pay with UPI via
              Razorpay checkout.
            </p>
            <div className="mt-6">
              <PayButton
                token={state.token}
                pendingAmount={state.view.order.pendingAmount}
              />
            </div>
            <p className="mt-4 text-center text-xs text-[#4a9f5c]">
              Payments secured by Razorpay
            </p>
          </div>
        </aside>
      </div>
    </PayShell>
  );
}
