import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { categoryWeightDiscounts } from "./category-weight-discounts";

export const productDiscountPrices = pgTable(
  "ProductDiscountPrice",
  {
    id: text("id").primaryKey(),
    productId: text("productId")
      .notNull()
      .references(() => products.id),
    discountId: text("discountId")
      .notNull()
      .references(() => categoryWeightDiscounts.id),
    discountPrice: doublePrecision("discountPrice").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    index("ProductDiscountPrice_productId_idx").on(table.productId),
    index("ProductDiscountPrice_discountId_idx").on(table.discountId),
    uniqueIndex("ProductDiscountPrice_productId_discountId_key").on(
      table.productId,
      table.discountId,
    ),
  ],
);
