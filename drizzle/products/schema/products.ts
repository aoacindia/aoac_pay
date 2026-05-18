import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const products = pgTable(
  "Product",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    price: doublePrecision("price").notNull(),
    regularPrice: doublePrecision("regularPrice"),
    length: doublePrecision("length"),
    breadth: doublePrecision("breadth"),
    height: doublePrecision("height"),
    weight: doublePrecision("weight"),
    packingWeight: doublePrecision("packingWeight"),
    tax: integer("tax").notNull(),
    hsnsac: text("hsnsac"),
    mainImage: text("mainImage"),
    images: jsonb("images"),
    inStock: boolean("inStock").default(true).notNull(),
    approved: boolean("approved").notNull(),
    webVisible: boolean("webVisible").default(true).notNull(),
    stockCount: integer("stockCount"),
    vegetable: boolean("vegetable").default(false).notNull(),
    veg: boolean("veg").default(false).notNull(),
    frozen: boolean("frozen").default(false).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    createdBy: text("createdBy").notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
    updatedBy: text("updatedBy").notNull(),
    approvedAt: timestamp("approvedAt", { precision: 3, mode: "date" }),
    approvedBy: text("approvedBy"),
    categoryId: text("categoryId")
      .notNull()
      .references(() => categories.id),
  },
  (table) => [
    uniqueIndex("Product_code_key").on(table.code),
    index("Product_categoryId_idx").on(table.categoryId),
  ],
);
