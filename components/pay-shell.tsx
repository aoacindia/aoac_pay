import { PayHeader } from "@/components/pay-header";

type PayShellProps = {
  children: React.ReactNode;
  showHeader?: boolean;
};

export function PayShell({ children, showHeader = true }: PayShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#e8f5eb] via-[#f4faf5] to-white px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {showHeader ? <PayHeader /> : null}
        {children}
      </div>
    </main>
  );
}
