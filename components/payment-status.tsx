type PaymentStatusProps = {
  variant: "paid" | "invalid" | "error";
  message: string;
};

export function PaymentStatus({ variant, message }: PaymentStatusProps) {
  const styles = {
    paid: "border-amber-200 bg-amber-50 text-amber-900",
    invalid: "border-slate-200 bg-slate-50 text-slate-700",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div
      className={`rounded-2xl border px-6 py-8 text-center shadow-sm ${styles[variant]}`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
