import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getOrderById } from "@/lib/orders/admin";
import { formatPaiseINR } from "@/lib/format";
import { OrderFulfilment } from "@/components/admin/OrderFulfilment";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Order detail + fulfilment (feature 12, module 2). */
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const addr = order.shippingAddress;
  const addrLines = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.pincode].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-grey hover:underline">
        ← Orders
      </Link>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-mono text-2xl font-semibold">{order.orderNumber}</h1>
        <span className="text-sm text-grey">
          Placed {formatDateTime(order.createdAt)}
        </span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-card border border-line bg-white p-5">
            <h2 className="text-base font-semibold">Items</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left font-mono text-xs uppercase tracking-wide text-grey">
                <tr>
                  <th className="py-2">Product</th>
                  <th className="py-2">Pack</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2 text-right">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-2">{it.name ?? it.product_id ?? "—"}</td>
                    <td className="py-2 text-grey">{it.pack_key ?? "—"}</td>
                    <td className="py-2 text-grey">{it.qty ?? "—"}</td>
                    <td className="py-2 text-right text-grey">
                      {it.unit_price_paise != null
                        ? formatPaiseINR(it.unit_price_paise)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-grey">Subtotal</dt>
                <dd>{formatPaiseINR(order.subtotalPaise)}</dd>
              </div>
              {order.discountPaise > 0 && (
                <div className="flex justify-between">
                  <dt className="text-grey">
                    Discount{order.discountCode ? ` (${order.discountCode})` : ""}
                  </dt>
                  <dd>−{formatPaiseINR(order.discountPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-grey">Shipping</dt>
                <dd>{formatPaiseINR(order.shippingPaise)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{formatPaiseINR(order.totalPaise)}</dd>
              </div>
            </dl>
          </section>

          {/* Customer + address */}
          <section className="rounded-card border border-line bg-white p-5">
            <h2 className="text-base font-semibold">Customer</h2>
            <div className="mt-2 text-sm">
              <p>{order.customerName ?? "—"}</p>
              <p className="font-mono text-xs text-grey">{order.customerPhone}</p>
              {order.email && <p className="text-grey">{order.email}</p>}
            </div>
            <h3 className="mt-4 text-sm font-semibold">Shipping address</h3>
            <address className="mt-1 text-sm not-italic text-grey">
              {addrLines.length ? (
                addrLines.map((l, i) => <div key={i}>{l}</div>)
              ) : (
                <span>—</span>
              )}
            </address>
          </section>
        </div>

        {/* Fulfilment */}
        <aside className="rounded-card border border-line bg-paper-2 p-5">
          <h2 className="text-base font-semibold">Fulfilment</h2>
          <div className="mt-4">
            <OrderFulfilment
              orderId={order.id}
              initialStatus={order.status}
              initialTrackingUrl={order.trackingUrl}
              initialCourier={order.courier}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
