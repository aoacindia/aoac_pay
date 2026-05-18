import { eq, inArray } from "drizzle-orm";
import { getUsersDb, getProductsDb } from "@/lib/db";
import {
  orders,
  orderItems,
  users,
  PAYABLE_ORDER_STATUSES,
  type OrderStatus,
} from "@/drizzle/users/schema";
import { products } from "@/drizzle/products/schema";
import { calculatePendingAmount, calculateLineTotal } from "./calculations";

export type OrderPaymentView = {
  order: {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    orderDate: Date;
    invoiceType: string | null;
  };
  customer: {
    id: string;
    name: string;
    businessName: string | null;
    gstNumber: string | null;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
    lineTotal: number;
  }>;
  canPay: boolean;
};

export async function getOrderPaymentView(
  orderId: string,
): Promise<OrderPaymentView | null> {
  const usersDb = getUsersDb();

  const [orderRow] = await usersDb
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      paidAmount: orders.paidAmount,
      discountAmount: orders.discountAmount,
      orderDate: orders.orderDate,
      invoiceType: orders.invoiceType,
      orderBy: orders.orderBy,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderRow) return null;

  const [customer] = await usersDb
    .select({
      id: users.id,
      name: users.name,
      businessName: users.businessName,
      gstNumber: users.gstNumber,
      email: users.email,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, orderRow.orderBy))
    .limit(1);

  if (!customer) return null;

  const itemsRows = await usersDb
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      discount: orderItems.discount,
      tax: orderItems.tax,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const productIds = [...new Set(itemsRows.map((row) => row.productId))];
  const productNameById = new Map<string, string>();

  if (productIds.length > 0) {
    const productsDb = getProductsDb();
    const productRows = await productsDb
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(inArray(products.id, productIds));

    for (const product of productRows) {
      productNameById.set(product.id, product.name);
    }
  }

  const paidAmount = orderRow.paidAmount ?? 0;
  const pendingAmount = calculatePendingAmount({
    totalAmount: orderRow.totalAmount,
    paidAmount: orderRow.paidAmount,
    discountAmount: orderRow.discountAmount,
  });

  const canPay =
    PAYABLE_ORDER_STATUSES.includes(orderRow.status) && pendingAmount > 0;

  return {
    order: {
      id: orderRow.id,
      status: orderRow.status,
      totalAmount: orderRow.totalAmount,
      paidAmount,
      pendingAmount,
      orderDate: orderRow.orderDate,
      invoiceType: orderRow.invoiceType,
    },
    customer: {
      id: customer.id,
      name: customer.name,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber,
      email: customer.email,
      phone: customer.phone,
    },
    items: itemsRows.map((row) => ({
      id: row.id,
      productName: productNameById.get(row.productId) ?? "Product",
      quantity: row.quantity,
      price: row.price,
      discount: row.discount,
      tax: row.tax,
      lineTotal: calculateLineTotal({
        price: row.price,
        quantity: row.quantity,
        discount: row.discount,
      }),
    })),
    canPay,
  };
}

export function isOrderAlreadyPaid(status: OrderStatus): boolean {
  return !PAYABLE_ORDER_STATUSES.includes(status);
}
