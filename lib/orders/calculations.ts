export function calculatePendingAmount(order: {
  totalAmount: number;
  paidAmount: number | null;
  discountAmount: number | null;
}): number {
  const paid = order.paidAmount ?? 0;
  const pending = order.totalAmount - paid;
  return Math.max(0, Math.round(pending * 100) / 100);
}

export function calculateLineTotal(item: {
  price: number;
  quantity: number;
  discount: number;
}): number {
  const subtotal = item.price * item.quantity;
  const afterDiscount = subtotal - (item.discount ?? 0);
  return Math.round(afterDiscount * 100) / 100;
}

export function toPaise(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}
