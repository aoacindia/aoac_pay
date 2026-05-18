type PaymentStatusProps = {
  variant: "paid" | "invalid" | "error";
  message: string;
};

export function PaymentStatus({ variant, message }: PaymentStatusProps) {
  const styles = {
    paid: "border-[#168e2d]/30 bg-[#e8f5eb] text-[#127025]",
    invalid: "border-[#168e2d]/20 bg-white text-[#2d5a36]",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-6 text-center shadow-sm sm:rounded-2xl sm:px-6 sm:py-8 ${styles[variant]}`}
    >
      <p className="text-sm font-medium leading-relaxed sm:text-base">{message}</p>
    </div>
  );
}
