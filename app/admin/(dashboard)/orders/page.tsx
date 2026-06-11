import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listOrders } from "@/lib/orders/admin";
import {
  ORDER_STATUSES,
  isOrderStatus,
  type OrderStatus,
} from "@/lib/orders/types";
import { formatPaiseINR } from "@/lib/format";

/** Tailwind classes per status badge. */
const STATUS_BADGE: Record<OrderStatus, string> = {
  created: "bg-line/60 text-grey",
  paid: "bg-lime/40 text-ink",
  packed: "bg-amber/20 text-ink",
  shipped: "bg-ink text-white",
  delivered: "bg-ink-2 text-white",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Orders admin list with status + search filters (feature 12, module 2). */
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status: OrderStatus | undefined =
    sp.status && isOrderStatus(sp.status) ? sp.status : undefined;
  const search = sp.q?.trim() || undefined;

  const orders = await listOrders({ status, search });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Status</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Search</span>
          <input
            name="q"
            defaultValue={search ?? ""}
            placeholder="Order # or phone"
            className="rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <button type="submit" className="btn btn-ghost text-sm">
          Filter
        </button>
        {(status || search) && (
          <Link href="/admin/orders" className="text-sm text-grey hover:underline">
            Clear
          </Link>
        )}
      </form>

      <p className="mt-4 text-sm text-grey">
        {orders.length} order{orders.length === 1 ? "" : "s"}.
      </p>

      {orders.length === 0 ? (
        <p className="mt-4 rounded-card border border-line bg-paper-2 px-5 py-8 text-center text-sm text-grey">
          No orders match.
        </p>
      ) : (
        <div className="mt-2 overflow-hidden rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left font-mono text-xs uppercase tracking-wide text-grey">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="bg-white hover:bg-paper-2">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-xs font-medium text-ink hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{o.customerName ?? "—"}</div>
                    <div className="font-mono text-xs text-grey">
                      {o.customerPhone}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-grey">{o.itemCount}</td>
                  <td className="px-4 py-3 text-grey">
                    {formatPaiseINR(o.totalPaise)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-grey">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
