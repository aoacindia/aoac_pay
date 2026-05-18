import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  index,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const orderItems = pgTable(
  "OrderItem",
  {
    id: text("id").primaryKey(),
    orderId: text("orderId")
      .notNull()
      .references(() => orders.id),
    productId: text("productId").notNull(),
    quantity: integer("quantity").notNull(),
    price: doublePrecision("price").notNull(),
    discount: doublePrecision("discount").default(0).notNull(),
    tax: integer("tax").notNull(),
    customWeightItem: boolean("customWeightItem").default(false).notNull(),
    customWeight: doublePrecision("customWeight"),
  },
  (table) => [
    index("OrderItem_orderId_idx").on(table.orderId),
    index("OrderItem_productId_idx").on(table.productId),
  ],
);
