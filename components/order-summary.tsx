import type { OrderPaymentView } from "@/lib/orders/queries";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

type OrderSummaryProps = {
  view: OrderPaymentView;
};

export function OrderSummary({ view }: OrderSummaryProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Order
        </p>
        <h1 className="mt-1 font-mono text-lg font-semibold text-slate-900">
          {view.order.id}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Placed on{" "}
          {view.order.orderDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Bill To</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <DetailRow label="Customer" value={view.customer.name} />
          {view.customer.businessName ? (
            <DetailRow label="Business" value={view.customer.businessName} />
          ) : null}
          {view.customer.gstNumber ? (
            <DetailRow label="GSTIN" value={view.customer.gstNumber} />
          ) : null}
          <DetailRow label="Email" value={view.customer.email} />
          <DetailRow label="Phone" value={view.customer.phone} />
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TableHeader />
        <div className="divide-y divide-slate-100">
          {view.items.map((item) => (
            <TableRow key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <dl className="space-y-3 text-sm">
          <AmountRow label="Total" value={formatCurrency(view.order.totalAmount)} />
          <AmountRow
            label="Paid"
            value={formatCurrency(view.order.paidAmount)}
          />
          <div className="border-t border-slate-200 pt-3">
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
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
      className={`flex justify-between ${highlight ? "text-base font-semibold text-slate-900" : "text-slate-600"}`}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
      <span className="col-span-6">Item</span>
      <span className="col-span-2 text-center">Qty</span>
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
      <div className="col-span-6">
        <p className="font-medium text-slate-900">{item.productName}</p>
        <p className="text-xs text-slate-500">GST {item.tax}%</p>
      </div>
      <p className="col-span-2 text-center text-slate-700">{item.quantity}</p>
      <p className="col-span-2 text-right text-slate-700">
        {formatCurrency(item.price)}
      </p>
      <p className="col-span-2 text-right font-medium text-slate-900">
        {formatCurrency(item.lineTotal)}
      </p>
    </div>
  );
}
