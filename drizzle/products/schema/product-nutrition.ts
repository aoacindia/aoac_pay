import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const productNutrition = pgTable(
  "ProductNutrition",
  {
    id: text("id").primaryKey(),
    productId: text("productId")
      .notNull()
      .references(() => products.id),
    name: text("name").notNull(),
    grams: doublePrecision("grams").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [index("ProductNutrition_productId_idx").on(table.productId)],
);
