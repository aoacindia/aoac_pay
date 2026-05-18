import { PayPageClient } from "@/components/pay-page-client";

export const dynamic = "force-dynamic";

type PayPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function PayPage({ searchParams }: PayPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? null;

  return <PayPageClient token={token} />;
}
