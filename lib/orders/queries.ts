import { eq, inArray } from "drizzle-orm";
import { getUsersDb, getProductsDb } from "@/lib/db";
import {
  orders,
  orderItems,
  users,
  businesses,
  billingAddresses,
  addresses,
  PAYABLE_ORDER_STATUSES,
  type OrderStatus,
} from "@/drizzle/users/schema";
import { products } from "@/drizzle/products/schema";
import { calculatePendingAmount, calculateLineTotal } from "./calculations";

export type AddressView = {
  name?: string;
  phone?: string;
  houseNo: string;
  line1: string;
  line2: string | null;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
};

export type OrderPaymentView = {
  order: {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    itemsSubtotal: number;
    deliveryCharges: number;
    discountAmount: number;
    orderDate: Date;
    invoiceNumber: string | null;
    invoiceType: string | null;
    isBillToSameAsShipping: boolean;
    isBusinessOrder: boolean;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  business: {
    id: string;
    businessName: string;
    gstNumber: string | null;
    hasAdditionalTradeName: boolean;
    additionalTradeName: string | null;
  } | null;
  billingAddress: AddressView | null;
  shippingAddress: AddressView | null;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
    lineTotal: number;
    weight: number | null;
  }>;
  canPay: boolean;
};

function formatAddress(
  row: {
    name?: string | null;
    phone?: string | null;
    houseNo: string;
    line1: string;
    line2: string | null;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  } | null,
): AddressView | null {
  if (!row) return null;
  return {
    name: row.name ?? undefined,
    phone: row.phone ?? undefined,
    houseNo: row.houseNo,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    district: row.district,
    state: row.state,
    pincode: row.pincode,
    country: row.country,
  };
}

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
      shippingAmount: orders.shippingAmount,
      orderDate: orders.orderDate,
      invoiceNumber: orders.invoiceNumber,
      invoiceType: orders.invoiceType,
      orderBy: orders.orderBy,
      businessId: orders.businessId,
      shippingAddressId: orders.shippingAddressId,
      isBillToSameAsShipping: orders.isBillToSameAsShipping,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderRow) return null;

  const [customer] = await usersDb
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, orderRow.orderBy))
    .limit(1);

  if (!customer) return null;

  let business: OrderPaymentView["business"] = null;
  let billingAddress: AddressView | null = null;

  if (orderRow.businessId) {
    const [businessRow] = await usersDb
      .select({
        id: businesses.id,
        businessName: businesses.businessName,
        gstNumber: businesses.gstNumber,
        hasAdditionalTradeName: businesses.hasAdditionalTradeName,
        additionalTradeName: businesses.additionalTradeName,
      })
      .from(businesses)
      .where(eq(businesses.id, orderRow.businessId))
      .limit(1);

    if (businessRow) {
      business = businessRow;

      const [billingRow] = await usersDb
        .select({
          houseNo: billingAddresses.houseNo,
          line1: billingAddresses.line1,
          line2: billingAddresses.line2,
          city: billingAddresses.city,
          district: billingAddresses.district,
          state: billingAddresses.state,
          pincode: billingAddresses.pincode,
          country: billingAddresses.country,
        })
        .from(billingAddresses)
        .where(eq(billingAddresses.businessId, businessRow.id))
        .limit(1);

      billingAddress = formatAddress(billingRow ?? null);
    }
  }

  let shippingAddress: AddressView | null = null;
  if (orderRow.shippingAddressId) {
    const [shippingRow] = await usersDb
      .select({
        name: addresses.name,
        phone: addresses.phone,
        houseNo: addresses.houseNo,
        line1: addresses.line1,
        line2: addresses.line2,
        city: addresses.city,
        district: addresses.district,
        state: addresses.state,
        pincode: addresses.pincode,
        country: addresses.country,
      })
      .from(addresses)
      .where(eq(addresses.id, orderRow.shippingAddressId))
      .limit(1);

    shippingAddress = formatAddress(shippingRow ?? null);
  }

  if (orderRow.isBillToSameAsShipping && !billingAddress && shippingAddress) {
    billingAddress = shippingAddress;
  }

  const itemsRows = await usersDb
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      discount: orderItems.discount,
      tax: orderItems.tax,
      customWeightItem: orderItems.customWeightItem,
      customWeight: orderItems.customWeight,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const productIds = [...new Set(itemsRows.map((row) => row.productId))];
  const productById = new Map<string, { name: string; weight: number | null }>();

  if (productIds.length > 0) {
    const productsDb = getProductsDb();
    const productRows = await productsDb
      .select({
        id: products.id,
        name: products.name,
        weight: products.weight,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    for (const product of productRows) {
      productById.set(product.id, {
        name: product.name,
        weight: product.weight,
      });
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

  const items = itemsRows.map((row) => {
    const product = productById.get(row.productId);
    const weight = row.customWeightItem
      ? (row.customWeight ?? null)
      : (product?.weight ?? null);

    return {
      id: row.id,
      productName: product?.name ?? "Product",
      quantity: row.quantity,
      price: row.price,
      discount: row.discount,
      tax: row.tax,
      lineTotal: calculateLineTotal({
        price: row.price,
        quantity: row.quantity,
        discount: row.discount,
      }),
      weight,
    };
  });

  const itemsSubtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    order: {
      id: orderRow.id,
      status: orderRow.status,
      totalAmount: orderRow.totalAmount,
      paidAmount,
      pendingAmount,
      itemsSubtotal: Math.round(itemsSubtotal * 100) / 100,
      deliveryCharges: orderRow.shippingAmount ?? 0,
      discountAmount: orderRow.discountAmount ?? 0,
      orderDate: orderRow.orderDate,
      invoiceNumber: orderRow.invoiceNumber,
      invoiceType: orderRow.invoiceType,
      isBillToSameAsShipping: orderRow.isBillToSameAsShipping,
      isBusinessOrder: Boolean(orderRow.businessId && business),
    },
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
    business,
    billingAddress,
    shippingAddress,
    items,
    canPay,
  };
}

export function isOrderAlreadyPaid(status: OrderStatus): boolean {
  return !PAYABLE_ORDER_STATUSES.includes(status);
}
