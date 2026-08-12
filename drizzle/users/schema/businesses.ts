import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const businesses = pgTable(
  "Business",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    businessName: text("businessName").notNull(),
    gstNumber: text("gstNumber"),
    hasAdditionalTradeName: boolean("hasAdditionalTradeName")
      .default(false)
      .notNull(),
    additionalTradeName: text("additionalTradeName"),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [index("Business_userId_idx").on(table.userId)],
);
