import { pgEnum } from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("OrderStatus", [
  "PENDING",
  "ORDER_READY",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "ORDER_SHIPPED_WITHOUT_PAYMENT",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export const PAYABLE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "ORDER_SHIPPED_WITHOUT_PAYMENT",
];
