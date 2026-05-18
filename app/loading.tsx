import { PayShell } from "@/components/pay-shell";
import { PaymentLoading } from "@/components/payment-loading";

export default function Loading() {
  return (
    <PayShell showHeader={false}>
      <PaymentLoading message="Opening secure payment…" />
    </PayShell>
  );
}
