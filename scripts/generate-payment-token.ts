/**
 * Dev utility: generate a payment link JWT for an order.
 * Usage: npx tsx scripts/generate-payment-token.ts <orderId>
 */
import * as dotenv from "dotenv";
import { signPaymentToken } from "../lib/security/jwt";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  const orderId = process.argv[2];
  if (!orderId) {
    console.error("Usage: npx tsx scripts/generate-payment-token.ts <orderId>");
    process.exit(1);
  }

  const token = await signPaymentToken(orderId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  console.log("\nPayment link:\n");
  console.log(`${baseUrl}/pay?token=${encodeURIComponent(token)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
