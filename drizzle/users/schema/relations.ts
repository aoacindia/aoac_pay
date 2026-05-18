import { relations } from "drizzle-orm";
import { users } from "./users";
import { addresses } from "./addresses";
import { billingAddresses } from "./billing-addresses";
import { carts, bulkCarts } from "./cart";
import { orders } from "./orders";
import { orderItems } from "./order-items";
import { suppliers } from "./suppliers";
import { passwordResets } from "./password-reset";
import { suspensionReasons } from "./suspension-reasons";

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  billingAddresses: many(billingAddresses),
  carts: many(carts),
  bulkCarts: many(bulkCarts),
  orders: many(orders),
  passwordResets: many(passwordResets),
  suspensionReasons: many(suspensionReasons),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const billingAddressesRelations = relations(
  billingAddresses,
  ({ one }) => ({
    user: one(users, {
      fields: [billingAddresses.userId],
      references: [users.id],
    }),
  }),
);

export const cartsRelations = relations(carts, ({ one }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
}));

export const bulkCartsRelations = relations(bulkCarts, ({ one }) => ({
  user: one(users, {
    fields: [bulkCarts.userId],
    references: [users.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.orderBy],
    references: [users.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  supplier: one(suppliers, {
    fields: [orders.supplierId],
    references: [suppliers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

export const suspensionReasonsRelations = relations(
  suspensionReasons,
  ({ one }) => ({
    user: one(users, {
      fields: [suspensionReasons.userId],
      references: [users.id],
    }),
  }),
);
