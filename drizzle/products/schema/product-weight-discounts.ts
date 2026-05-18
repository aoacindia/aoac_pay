import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const productWeightDiscounts = pgTable(
  "ProductWeightDiscount",
  {
    id: text("id").primaryKey(),
    productId: text("productId")
      .notNull()
      .references(() => products.id),
    minWeight: doublePrecision("minWeight").notNull(),
    price: doublePrecision("price").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [index("ProductWeightDiscount_productId_idx").on(table.productId)],
);
