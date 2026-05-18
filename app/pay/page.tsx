import { verifyPaymentToken } from "@/lib/security/jwt";
import {
  getOrderPaymentView,
  isOrderAlreadyPaid,
} from "@/lib/orders/queries";
import { OrderSummary } from "@/components/order-summary";
import { PayButton } from "@/components/pay-button";
import { PayHeader } from "@/components/pay-header";
import { PaymentStatus } from "@/components/payment-status";

export const dynamic = "force-dynamic";

type PayPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function PayPage({ searchParams }: PayPageProps) {
  const params = await searchParams;
  const token = params.token?.trim();

  if (!token) {
    return (
      <PageShell>
        <PaymentStatus variant="invalid" message="Invalid payment link." />
      </PageShell>
    );
  }

  let orderId: string;
  try {
    const payload = await verifyPaymentToken(token);
    orderId = payload.orderId;
  } catch {
    return (
      <PageShell>
        <PaymentStatus
          variant="error"
          message="This payment link is invalid or has been tampered with."
        />
      </PageShell>
    );
  }

  const view = await getOrderPaymentView(orderId);

  if (!view) {
    return (
      <PageShell>
        <PaymentStatus variant="error" message="Order not found." />
      </PageShell>
    );
  }

  if (isOrderAlreadyPaid(view.order.status) || !view.canPay) {
    return (
      <PageShell>
        <PaymentStatus
          variant="paid"
          message="This order has already been paid."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <OrderSummary view={view} />

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Amount due is calculated securely on our servers. Pay with UPI via
              Razorpay checkout.
            </p>
            <div className="mt-6">
              <PayButton
                token={token}
                pendingAmount={view.order.pendingAmount}
              />
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Payments secured by Razorpay
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <PayHeader />
        {children}
      </div>
    </main>
  );
}
