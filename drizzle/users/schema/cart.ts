import { integer, pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const carts = pgTable(
  "Cart",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    productId: text("productId").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    index("cart_user_product_idx").on(table.userId, table.productId),
    index("Cart_userId_idx").on(table.userId),
  ],
);

export const bulkCarts = pgTable(
  "BulkCart",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    productId: text("productId").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    index("bulk_cart_user_product_idx").on(table.userId, table.productId),
    index("BulkCart_userId_idx").on(table.userId),
  ],
);
