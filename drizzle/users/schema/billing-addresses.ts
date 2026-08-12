import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

export const billingAddresses = pgTable(
  "BillingAddress",
  {
    id: text("id").primaryKey(),
    businessId: text("businessId")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
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
    uniqueIndex("BillingAddress_businessId_key").on(table.businessId),
    index("BillingAddress_businessId_idx").on(table.businessId),
  ],
);
