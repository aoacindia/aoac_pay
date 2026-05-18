import {
  boolean,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const addresses = pgTable(
  "Address",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    houseNo: text("houseNo").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    district: text("district").notNull(),
    state: text("state").notNull(),
    stateCode: text("stateCode"),
    country: text("country").default("India").notNull(),
    pincode: text("pincode").notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [index("Address_userId_idx").on(table.userId)],
);
