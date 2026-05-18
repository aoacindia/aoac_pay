import { PayHeader } from "@/components/pay-header";

type PayShellProps = {
  children: React.ReactNode;
  showHeader?: boolean;
};

export function PayShell({ children, showHeader = true }: PayShellProps) {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#e8f5eb] via-[#f4faf5] to-white safe-px py-5 sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-4xl min-w-0 px-0 sm:px-1">
        {showHeader ? <PayHeader /> : null}
        {children}
      </div>
    </main>
  );
}
