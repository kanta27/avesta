import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  listDiscountCodes,
  type DiscountCodeListItem,
} from "@/lib/discounts";
import { formatPaiseINR } from "@/lib/format";
import { DiscountActiveToggle } from "@/components/admin/DiscountActiveToggle";

function formatValue(c: DiscountCodeListItem): string {
  if (c.kind === "percent") return `${c.valuePct ?? 0}% off`;
  if (c.kind === "flat")
    return `${formatPaiseINR(c.valuePaise ?? 0)} off`;
  return "Free shipping";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Discount codes admin list (feature 12, module 3). */
export default async function AdminDiscountsPage() {
  await requireAdmin();
  const codes = await listDiscountCodes();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Discount codes</h1>
          <p className="mt-1 text-sm text-grey">
            {codes.length} code{codes.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/admin/discounts/new" className="btn btn-primary text-sm">
          + New code
        </Link>
      </div>

      {codes.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-paper-2 px-5 py-8 text-center text-sm text-grey">
          No discount codes yet.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left font-mono text-xs uppercase tracking-wide text-grey">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {codes.map((c) => (
                <tr key={c.id} className="bg-white">
                  <td className="px-4 py-3 font-mono font-medium text-ink">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-grey">{formatValue(c)}</td>
                  <td className="px-4 py-3 text-grey">
                    {c.minOrderPaise > 0 ? formatPaiseINR(c.minOrderPaise) : "—"}
                  </td>
                  <td className="px-4 py-3 text-grey">
                    {c.usedCount}
                    {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-grey">
                    {formatDate(c.expiresAt)}
                  </td>
                  <td className="px-4 py-3">
                    <DiscountActiveToggle id={c.id} initialActive={c.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
