import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { orderStatusEnum } from "./enums";
import { users } from "./users";
import { addresses } from "./addresses";
import { suppliers } from "./suppliers";

export const orders = pgTable(
  "Order",
  {
    id: text("id").primaryKey(),
    orderBy: text("orderBy")
      .notNull()
      .references(() => users.id),
    orderDate: timestamp("orderDate", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    status: orderStatusEnum("status").default("PENDING").notNull(),
    totalAmount: doublePrecision("totalAmount").notNull(),
    discountAmount: doublePrecision("discountAmount"),
    paidAmount: doublePrecision("paidAmount"),
    packed: boolean("packed").default(false).notNull(),
    refund: boolean("refund").default(false).notNull(),
    customOrder: boolean("customOrder").default(false).notNull(),
    rOrderId: text("r_orderId"),
    rPaymentId: text("r_paymentId"),
    paymentLinkUrl: text("paymentLinkUrl"),
    paymentMethod: text("paymentMethod"),
    paymentVpa: text("paymentVpa"),
    courierId: integer("courierId"),
    shippingId: text("shippingId"),
    shippingAmount: doublePrecision("shippingAmount"),
    awsCode: text("awsCode"),
    shippingInvoiceNumber: text("shippingInvoiceNumber"),
    shippingCourierName: text("shippingCourierName"),
    estimatedDeliveryDate: text("estimatedDeliveryDate"),
    pickupScheduled: timestamp("pickupScheduled", {
      precision: 3,
      mode: "date",
    }),
    deliveredAt: timestamp("deliveredAt", { precision: 3, mode: "date" }),
    manifestGenerated: boolean("manifestGenerated").default(false),
    invoiceNumber: text("InvoiceNumber"),
    invoiceType: text("invoiceType"),
    invoiceSequenceNumber: integer("invoiceSequenceNumber"),
    invoiceOfficeId: text("invoiceOfficeId"),
    roundedOffAmount: doublePrecision("roundedOffAmount"),
    invoiceAmount: doublePrecision("invoiceAmount"),
    refundId: text("refundId"),
    refundReceipt: text("refundReceipt"),
    refundArn: text("refundArn"),
    refundCreatedAt: timestamp("refundCreatedAt", {
      precision: 3,
      mode: "date",
    }),
    isDifferentSupplier: boolean("isDifferentSupplier").default(false),
    supplierId: text("supplierId").references(() => suppliers.id),
    shippingAddressId: text("shippingAddressId").references(
      () => addresses.id,
    ),
  },
  (table) => [
    index("Order_orderBy_idx").on(table.orderBy),
    index("Order_status_idx").on(table.status),
    index("Order_supplierId_idx").on(table.supplierId),
  ],
);
