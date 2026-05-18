import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";

const paymentTokenPayloadSchema = z.object({
  orderId: z.string().min(1),
  type: z.literal("PAYMENT_LINK"),
});

export type PaymentTokenPayload = z.infer<typeof paymentTokenPayloadSchema>;

function getSecretKey() {
  const env = getServerEnv();
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function signPaymentToken(orderId: string): Promise<string> {
  return new SignJWT({ orderId, type: "PAYMENT_LINK" })
    .setProtectedHeader({ alg: "HS256" })
    .sign(getSecretKey());
}

export async function verifyPaymentToken(
  token: string,
): Promise<PaymentTokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(), {
    algorithms: ["HS256"],
  });

  const parsed = paymentTokenPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Invalid payment token payload");
  }

  return parsed.data;
}
