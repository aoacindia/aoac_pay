import { pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const billingAddresses = pgTable(
  "BillingAddress",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    houseNo: text("houseNo").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    district: text("district").notNull(),
    state: text("state").notNull(),
    stateCode: text("stateCode"),
    country: text("country").default("India").notNull(),
    pincode: text("pincode").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("BillingAddress_userId_key").on(table.userId),
    index("BillingAddress_userId_idx").on(table.userId),
  ],
);
