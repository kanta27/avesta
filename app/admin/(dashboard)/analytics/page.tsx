import { requireAdmin } from "@/lib/auth/require-admin";
import {
  computeAnalytics,
  parseRange,
  PAID_STATUS_LABEL,
  type DateRange,
} from "@/lib/analytics/admin";
import { formatPaiseINR } from "@/lib/format";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

/**
 * Analytics dashboard (feature 13). Server component: computes everything
 * server-side via the service-role client behind `requireAdmin()` (per-page gate,
 * not just the layout). Live numbers come from `orders`; traffic + cart metrics
 * read `pageviews` / `carts`, which are EMPTY until the Phase 2 features (22 / 18)
 * populate them — so those render clearly-labeled empty states, never fabricated
 * numbers. Conversion guards its denominator and renders "—" when sessions = 0.
 *
 * The only serializable thing handed to the chart island is `orders.series`; the
 * island must not import the (server-only) analytics module.
 */

const MS_PER_DAY = 86_400_000;

function fmtDay(iso: string): string {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Build a preset href ending today (UTC), spanning `days` inclusive. */
function presetRange(days: number): { fromISO: string; toISO: string } {
  const toISO = new Date().toISOString().slice(0, 10);
  const fromISO = new Date(
    Date.parse(`${toISO}T00:00:00.000Z`) - (days - 1) * MS_PER_DAY,
  )
    .toISOString()
    .slice(0, 10);
  return { fromISO, toISO };
}

const PRESETS = [7, 30, 90] as const;

function KpiCard({
  label,
  value,
  sub,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-card border border-line bg-paper-2 px-5 py-4">
      <p className="font-mono text-xs uppercase tracking-widest text-grey">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold ${muted ? "text-grey" : "text-ink"}`}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-grey">{sub}</p> : null}
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const range: DateRange = parseRange({ from: sp.from, to: sp.to });
  const summary = await computeAnalytics(range);

  const { orders, traffic, carts, conversionRate } = summary;
  const hasTraffic = traffic.totalPageviews > 0;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-xs uppercase tracking-widest text-grey">
        Analytics
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Store performance</h1>
      <p className="mt-1 text-sm text-grey">
        {fmtDay(range.fromISO)} – {fmtDay(range.toISO)}
      </p>

      {/* Date-range control — URL search params, native date inputs, no date lib. */}
      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">From</span>
          <input
            type="date"
            name="from"
            defaultValue={range.fromISO}
            className="rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">To</span>
          <input
            type="date"
            name="to"
            defaultValue={range.toISO}
            className="rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <button type="submit" className="btn btn-ghost text-sm">
          Apply
        </button>
        <span className="flex flex-wrap gap-1.5">
          {PRESETS.map((days) => {
            const p = presetRange(days);
            const active = p.fromISO === range.fromISO && p.toISO === range.toISO;
            return (
              <a
                key={days}
                href={`/admin/analytics?from=${p.fromISO}&to=${p.toISO}`}
                aria-current={active ? "true" : undefined}
                className={`rounded-card px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "border border-line text-grey hover:text-ink"
                }`}
              >
                {days}d
              </a>
            );
          })}
        </span>
      </form>

      {/* Live metrics — derived from `orders` (paid set). */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Revenue</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Revenue"
            value={formatPaiseINR(orders.revenuePaise)}
            sub={`Paid orders only (${PAID_STATUS_LABEL})`}
          />
          <KpiCard label="Paid orders" value={String(orders.paidOrders)} />
          <KpiCard
            label="Avg. order value"
            value={orders.aovPaise === null ? "—" : formatPaiseINR(orders.aovPaise)}
            sub={orders.aovPaise === null ? "No paid orders in range" : undefined}
            muted={orders.aovPaise === null}
          />
        </div>
      </section>

      {/* Charts — wired to the Recharts island in the next section. */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Over time</h2>
        <div className="mt-3">
          <AnalyticsCharts series={orders.series} />
        </div>
      </section>

      {/* Traffic — read path against `pageviews`; empty until Phase 2 (feature 22). */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Traffic</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Visitors"
            value={hasTraffic ? String(traffic.distinctSessions) : "—"}
            sub={
              hasTraffic
                ? "Distinct sessions"
                : "Awaiting traffic data (lands with the Phase 2 analytics layer)"
            }
            muted={!hasTraffic}
          />
          <KpiCard
            label="Conversion rate"
            value={
              conversionRate === null
                ? "—"
                : `${(conversionRate * 100).toFixed(1)}%`
            }
            sub={
              conversionRate === null
                ? "Awaiting traffic data (Phase 2)"
                : "Paid orders ÷ sessions"
            }
            muted={conversionRate === null}
          />
          <KpiCard
            label="Pageviews"
            value={hasTraffic ? String(traffic.totalPageviews) : "—"}
            sub={hasTraffic ? undefined : "Awaiting traffic data (Phase 2)"}
            muted={!hasTraffic}
          />
        </div>

        <div className="mt-4 rounded-card border border-line bg-paper-2 px-5 py-4">
          <p className="font-mono text-xs uppercase tracking-widest text-grey">
            Top pages
          </p>
          {traffic.topPages.length === 0 ? (
            <p className="mt-2 text-sm text-grey">
              Awaiting traffic data (lands with the Phase 2 analytics layer).
            </p>
          ) : (
            <ol className="mt-3 divide-y divide-line text-sm">
              {traffic.topPages.map((p) => (
                <li
                  key={p.path}
                  className="flex items-center justify-between py-2"
                >
                  <span className="truncate font-mono text-xs text-ink">
                    {p.path}
                  </span>
                  <span className="text-grey">{p.views}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Carts — read path against `carts`; empty until Phase 2 (feature 18). */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Cart recovery</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Abandoned carts"
            value={carts.abandoned > 0 ? String(carts.abandoned) : "—"}
            sub={
              carts.abandoned > 0
                ? "Status active / abandoned"
                : "Awaiting cart recovery (Phase 2)"
            }
            muted={carts.abandoned === 0}
          />
        </div>
      </section>
    </div>
  );
}
