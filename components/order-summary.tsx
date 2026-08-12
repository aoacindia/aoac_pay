import type { AddressView, OrderPaymentView } from "@/lib/orders/queries";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatWeight(grams: number | null) {
  if (grams == null || Number.isNaN(grams) || grams < 0) return null;

  if (grams >= 1000) {
    const kg = grams / 1000;
    const formatted = Number.isInteger(kg) ? String(kg) : kg.toFixed(3).replace(/\.?0+$/, "");
    return `${formatted} kg`;
  }

  const formatted = Number.isInteger(grams)
    ? String(grams)
    : grams.toFixed(2).replace(/\.?0+$/, "");
  return `${formatted} g`;
}

function formatAddressLines(address: AddressView) {
  const lines = [
    [address.houseNo, address.line1].filter(Boolean).join(", "),
    address.line2,
    [address.city, address.district].filter(Boolean).join(", "),
    [address.state, address.pincode].filter(Boolean).join(" — "),
    address.country,
  ].filter((line): line is string => Boolean(line && line.trim()));

  return lines;
}

type OrderSummaryProps = {
  view: OrderPaymentView;
};

const cardClass =
  "rounded-xl border border-[#168e2d]/15 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5 md:p-6";

export function OrderSummary({ view }: OrderSummaryProps) {
  const billedAddress =
    view.order.isBusinessOrder && !view.order.isBillToSameAsShipping
      ? view.billingAddress
      : view.order.isBillToSameAsShipping
        ? (view.shippingAddress ?? view.billingAddress)
        : view.billingAddress;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <section className={cardClass}>
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#4a9f5c] sm:text-xs">
          Order
        </p>
        <h2 className="mt-1 break-all font-mono text-base font-semibold text-[#1a3d22] sm:text-lg">
          {view.order.id}
        </h2>
        {view.order.invoiceNumber ? (
          <p className="mt-2 break-words text-xs text-[#2d5a36] sm:text-sm">
            <span className="text-[#4a9f5c]">
              {view.order.invoiceType === "PI"
                ? "Proforma invoice"
                : "Invoice"}
              :{" "}
            </span>
            <span className="font-medium">{view.order.invoiceNumber}</span>
          </p>
        ) : null}
        <p className="mt-2 text-xs text-[#4a9f5c] sm:text-sm">
          Placed on{" "}
          {view.order.orderDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </section>

      <section className={cardClass}>
        <h2 className="text-sm font-semibold text-[#168e2d] sm:text-base">
          Bill To
        </h2>
        <dl className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-2">
          {view.order.isBusinessOrder && view.business ? (
            <>
              <DetailRow label="Business" value={view.business.businessName} />
              {view.business.gstNumber ? (
                <DetailRow label="GSTIN" value={view.business.gstNumber} />
              ) : null}
              {view.business.hasAdditionalTradeName &&
              view.business.additionalTradeName ? (
                <DetailRow
                  label="Trade name"
                  value={view.business.additionalTradeName}
                />
              ) : null}
              <DetailRow label="Contact person" value={view.customer.name} />
            </>
          ) : (
            <DetailRow label="Customer" value={view.customer.name} />
          )}
          <DetailRow label="Email" value={view.customer.email} breakValue />
          <DetailRow label="Phone" value={view.customer.phone} />
          {billedAddress ? (
            <AddressBlock
              label={
                view.order.isBillToSameAsShipping
                  ? "Address"
                  : "Billing address"
              }
              address={billedAddress}
            />
          ) : null}
        </dl>
      </section>

      {view.shippingAddress &&
      !view.order.isBillToSameAsShipping &&
      billedAddress !== view.shippingAddress ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-[#168e2d] sm:text-base">
            Ship To
          </h2>
          <dl className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-2">
            {view.shippingAddress.name ? (
              <DetailRow label="Name" value={view.shippingAddress.name} />
            ) : null}
            {view.shippingAddress.phone ? (
              <DetailRow label="Phone" value={view.shippingAddress.phone} />
            ) : null}
            <AddressBlock label="Address" address={view.shippingAddress} />
          </dl>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-[#168e2d]/15 bg-white shadow-sm sm:rounded-2xl">
        <h2 className="border-b border-[#168e2d]/10 bg-[#e8f5eb] px-4 py-3 text-sm font-semibold text-[#168e2d] md:hidden">
          Items
        </h2>

        <ul className="divide-y divide-[#168e2d]/10 md:hidden">
          {view.items.map((item) => (
            <li key={item.id} className="p-4">
              <p className="font-medium leading-snug text-[#1a3d22]">
                {item.productName}
              </p>
              <p className="mt-0.5 text-xs text-[#4a9f5c]">
                GST {item.tax}%
                {formatWeight(item.weight)
                  ? ` · ${formatWeight(item.weight)}`
                  : ""}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#4a9f5c] sm:text-xs">
                    Qty
                  </p>
                  <p className="mt-0.5 font-medium text-[#1a3d22]">
                    {item.quantity}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wide text-[#4a9f5c] sm:text-xs">
                    Rate
                  </p>
                  <p className="mt-0.5 font-medium text-[#1a3d22]">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-[#4a9f5c] sm:text-xs">
                    Amount
                  </p>
                  <p className="mt-0.5 font-semibold text-[#168e2d]">
                    {formatCurrency(item.lineTotal)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <TableHeader />
          <div className="divide-y divide-[#168e2d]/10">
            {view.items.map((item) => (
              <TableRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#168e2d]/15 bg-[#e8f5eb]/50 p-4 sm:rounded-2xl sm:p-5 md:p-6">
        <dl className="space-y-2.5 text-xs sm:space-y-3 sm:text-sm">
          <AmountRow
            label="Items subtotal"
            value={formatCurrency(view.order.itemsSubtotal)}
          />
          <AmountRow
            label="Delivery charges"
            value={formatCurrency(view.order.deliveryCharges)}
          />
          {view.order.discountAmount > 0 ? (
            <AmountRow
              label="Discount"
              value={`-${formatCurrency(view.order.discountAmount)}`}
            />
          ) : null}
          <AmountRow
            label="Order total"
            value={formatCurrency(view.order.totalAmount)}
          />
          <AmountRow
            label="Paid"
            value={formatCurrency(view.order.paidAmount)}
          />
          <div className="border-t border-[#168e2d]/20 pt-2.5 sm:pt-3">
            <AmountRow
              label="Pending"
              value={formatCurrency(view.order.pendingAmount)}
              highlight
            />
          </div>
        </dl>
      </section>
    </div>
  );
}

function AddressBlock({
  label,
  address,
}: {
  label: string;
  address: AddressView;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between min-[400px]:gap-4">
      <dt className="shrink-0 text-xs text-[#4a9f5c] sm:text-sm">{label}</dt>
      <dd className="min-[400px]:text-right sm:text-sm">
        {address.name ? (
          <p className="font-medium text-[#1a3d22]">{address.name}</p>
        ) : null}
        {formatAddressLines(address).map((line) => (
          <p key={line} className="text-[#1a3d22]">
            {line}
          </p>
        ))}
      </dd>
    </div>
  );
}

function DetailRow({
  label,
  value,
  breakValue,
}: {
  label: string;
  value: string;
  breakValue?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between min-[400px]:gap-4">
      <dt className="shrink-0 text-xs text-[#4a9f5c] sm:text-sm">{label}</dt>
      <dd
        className={`font-medium text-[#1a3d22] min-[400px]:text-right sm:text-sm ${breakValue ? "break-all" : "break-words"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function AmountRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 ${
        highlight
          ? "text-sm font-semibold text-[#168e2d] sm:text-base"
          : "text-[#2d5a36]"
      }`}
    >
      <dt className="shrink-0">{label}</dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="grid grid-cols-12 gap-2 border-b border-[#168e2d]/10 bg-[#e8f5eb] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#4a9f5c]">
      <span className="col-span-5">Item</span>
      <span className="col-span-2 text-center">Weight</span>
      <span className="col-span-1 text-center">Qty</span>
      <span className="col-span-2 text-right">Rate</span>
      <span className="col-span-2 text-right">Amount</span>
    </div>
  );
}

function TableRow({
  item,
}: {
  item: OrderPaymentView["items"][number];
}) {
  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-4 text-sm">
      <div className="col-span-5 min-w-0">
        <p className="font-medium text-[#1a3d22]">{item.productName}</p>
        <p className="text-xs text-[#4a9f5c]">GST {item.tax}%</p>
      </div>
      <p className="col-span-2 text-center text-[#2d5a36]">
        {formatWeight(item.weight) ?? "—"}
      </p>
      <p className="col-span-1 text-center text-[#2d5a36]">{item.quantity}</p>
      <p className="col-span-2 text-right tabular-nums text-[#2d5a36]">
        {formatCurrency(item.price)}
      </p>
      <p className="col-span-2 text-right font-medium tabular-nums text-[#168e2d]">
        {formatCurrency(item.lineTotal)}
      </p>
    </div>
  );
}
