import { Fragment } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  LEAD_SOURCE_TYPES,
  isLeadSourceType,
  listLeads,
  type LeadFilter,
  type LeadSourceType,
} from "@/lib/leads/admin";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Build the export href carrying the current filters. */
function exportHref(filter: LeadFilter): string {
  const params = new URLSearchParams();
  if (filter.sourceType) params.set("source_type", filter.sourceType);
  if (filter.converted === true) params.set("converted", "yes");
  if (filter.converted === false) params.set("converted", "no");
  const qs = params.toString();
  return `/admin/leads/export${qs ? `?${qs}` : ""}`;
}

/** Leads admin: view, filter, conversion column, CSV export (feature 12, module 4). */
export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ source_type?: string; converted?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const sourceType: LeadSourceType | undefined =
    sp.source_type && isLeadSourceType(sp.source_type)
      ? sp.source_type
      : undefined;
  const converted =
    sp.converted === "yes" ? true : sp.converted === "no" ? false : undefined;

  const filter: LeadFilter = { sourceType, converted };
  const leads = await listLeads(filter);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <a href={exportHref(filter)} className="btn btn-primary text-sm">
          Export CSV
        </a>
      </div>

      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Source</span>
          <select
            name="source_type"
            defaultValue={sourceType ?? ""}
            className="rounded-card border border-line bg-white px-3 py-2 text-sm capitalize outline-none focus:border-ink"
          >
            <option value="">All</option>
            {LEAD_SOURCE_TYPES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Converted</span>
          <select
            name="converted"
            defaultValue={sp.converted === "yes" || sp.converted === "no" ? sp.converted : ""}
            className="rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="">All</option>
            <option value="yes">Converted</option>
            <option value="no">Not converted</option>
          </select>
        </label>
        <button type="submit" className="btn btn-ghost text-sm">
          Filter
        </button>
        {(sourceType || converted !== undefined) && (
          <Link href="/admin/leads" className="text-sm text-grey hover:underline">
            Clear
          </Link>
        )}
      </form>

      <p className="mt-4 text-sm text-grey">
        {leads.length} lead{leads.length === 1 ? "" : "s"}.
      </p>

      {leads.length === 0 ? (
        <p className="mt-4 rounded-card border border-line bg-paper-2 px-5 py-8 text-center text-sm text-grey">
          No leads match.
        </p>
      ) : (
        <div className="mt-2 overflow-hidden rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left font-mono text-xs uppercase tracking-wide text-grey">
              <tr>
                <th className="px-4 py-3">Captured</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Consent</th>
                <th className="px-4 py-3">Converted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((l) => (
                <Fragment key={l.id}>
                  <tr className="bg-white">
                    <td className="px-4 py-3 text-grey">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-ink">{l.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-grey">
                        {l.phone ?? "—"}
                      </div>
                      <div className="text-xs text-grey">{l.email ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 capitalize text-grey">
                      {l.sourceType}
                    </td>
                    <td className="px-4 py-3">
                      {l.consentWhatsapp ? (
                        <span className="text-xs text-ink">WhatsApp ✓</span>
                      ) : (
                        <span className="text-xs text-grey">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {l.converted ? (
                        l.convertedOrderId ? (
                          <Link
                            href={`/admin/orders/${l.convertedOrderId}`}
                            className="rounded-full bg-lime/40 px-2.5 py-0.5 text-xs font-medium text-ink hover:bg-lime/60"
                          >
                            Converted
                          </Link>
                        ) : (
                          <span className="rounded-full bg-lime/40 px-2.5 py-0.5 text-xs font-medium text-ink">
                            Converted
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-grey">No</span>
                      )}
                    </td>
                  </tr>
                  {l.b2b && (
                    <tr className="bg-paper-2/60">
                      <td colSpan={6} className="px-4 pb-3 pt-0">
                        <dl className="grid gap-x-6 gap-y-1 text-xs text-grey sm:grid-cols-[auto_1fr]">
                          {l.b2b.orgType && (
                            <>
                              <dt className="font-mono uppercase tracking-wide">Org</dt>
                              <dd className="capitalize text-ink">{l.b2b.orgType}</dd>
                            </>
                          )}
                          {l.b2b.volume && (
                            <>
                              <dt className="font-mono uppercase tracking-wide">Volume</dt>
                              <dd className="text-ink">{l.b2b.volume}</dd>
                            </>
                          )}
                          {l.b2b.message && (
                            <>
                              <dt className="font-mono uppercase tracking-wide">Message</dt>
                              <dd className="whitespace-pre-wrap text-ink">{l.b2b.message}</dd>
                            </>
                          )}
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
