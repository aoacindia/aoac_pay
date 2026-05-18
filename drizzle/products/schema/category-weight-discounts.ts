import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const categoryWeightDiscounts = pgTable(
  "CategoryWeightDiscount",
  {
    id: text("id").primaryKey(),
    minWeight: doublePrecision("minWeight").notNull(),
    categoryId: text("categoryId")
      .notNull()
      .references(() => categories.id),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    index("CategoryWeightDiscount_categoryId_idx").on(table.categoryId),
  ],
);
