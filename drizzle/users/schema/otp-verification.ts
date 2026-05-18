import { pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

export const otpVerifications = pgTable(
  "OtpVerification",
  {
    id: text("id").primaryKey(),
    email: text("email"),
    token: text("token").notNull(),
    otp: text("otp").notNull(),
    expiresAt: timestamp("expiresAt", { precision: 3, mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("OtpVerification_token_key").on(table.token),
    index("OtpVerification_email_idx").on(table.email),
    index("OtpVerification_token_idx").on(table.token),
  ],
);
