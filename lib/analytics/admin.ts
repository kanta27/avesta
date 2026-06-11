import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin analytics data layer (feature 13). Service-role, behind `requireAdmin()`
 * at every call site (the page). Mirrors the feature-12 compute pattern in
 * `lib/orders/admin.ts`: server-only, returns plain serializable objects so a
 * `"use client"` chart island can be fed the result WITHOUT importing this
 * module (which would drag the service-role client into the browser bundle).
 *
 * CENTRAL REALITY: only `orders` carries live data today. `pageviews` is written
 * by feature 22 (Phase 2 analytics pixel) and `carts` by feature 18 — both are
 * EMPTY now, so the traffic/cart reads below are real read paths that return
 * 0 / [] today and light up unchanged when those features land. We never
 * fabricate numbers; the page renders labeled empty states for them.
 *
 * Money is integer paise end-to-end here; formatting to ₹ happens only at the
 * display edge (`lib/format`).
 */

/**
 * Order statuses that count as revenue (confirmed scope). A `created` order is
 * not yet paid; `cancelled`/`refunded` are excluded. This set drives revenue,
 * paid-order count, AOV, and the conversion-rate numerator.
 */
const PAID_STATUSES = ["paid", "packed", "shipped", "delivered"] as const;
const PAID_SET: ReadonlySet<string> = new Set(PAID_STATUSES);
export const PAID_STATUS_LABEL = "paid · packed · shipped · delivered";

/** Cart statuses that count as "abandoned" for the recovery metric (feature 18). */
const ABANDONED_CART_STATUSES = ["active", "abandoned"] as const;

/** Guard limit on the raw pageview fetch. Empty today; revisit when feature 22
 * lands traffic volume — at that point distinct-session + top-path counting
 * should move to a DB-side aggregate (RPC / materialized) instead of fetching
 * rows and reducing in JS. If the cap is ever hit we warn (no silent truncation). */
const PAGEVIEW_FETCH_CAP = 50_000;

const MS_PER_DAY = 86_400_000;
/** Asia/Kolkata is a fixed +05:30 offset (no DST), so a constant shift is exact. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** A normalized, inclusive date range, anchored to IST (Asia/Kolkata) — this is an
 * India-only store, so days are reckoned in IST, not UTC (otherwise early-morning-IST
 * orders misattribute to the prior day). Boundaries are IST midnights and the chart's
 * per-day buckets are IST-dated, so the buckets still sum EXACTLY to the range KPIs
 * (which just sum every paid order the IST-bounded query returns). `fromISO`/`toISO`
 * are the `YYYY-MM-DD` IST calendar dates. */
export interface DateRange {
  fromISO: string;
  toISO: string;
  /** Inclusive lower bound — midnight IST of `fromISO`, `<fromISO>T00:00:00.000+05:30`. */
  fromIso8601: string;
  /** EXCLUSIVE upper bound — midnight IST of the day after `toISO`. */
  toExclusiveIso8601: string;
}

export interface RevenueSeriesPoint {
  /** IST (Asia/Kolkata) calendar day, `YYYY-MM-DD`. */
  date: string;
  revenuePaise: number;
  orders: number;
}

export interface OrdersMetrics {
  revenuePaise: number;
  paidOrders: number;
  /** revenue / paidOrders, or `null` when there are no paid orders (no divide-by-zero). */
  aovPaise: number | null;
  /** Gap-filled per-day series spanning the whole range (zero-filled days included). */
  series: RevenueSeriesPoint[];
}

export interface TrafficMetrics {
  /** Distinct `pageviews.session_id` in range. 0 until feature 22 lands. */
  distinctSessions: number;
  totalPageviews: number;
  topPages: { path: string; views: number }[];
}

export interface CartMetrics {
  /** Carts with status in ('active','abandoned'), created in range. 0 until feature 18. */
  abandoned: number;
}

export interface AnalyticsSummary {
  range: DateRange;
  orders: OrdersMetrics;
  traffic: TrafficMetrics;
  carts: CartMetrics;
  /** paidOrders / distinctSessions, or `null` when no sessions (renders "—", never NaN). */
  conversionRate: number | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A valid `YYYY-MM-DD` that round-trips through Date, else null. */
function normalizeDateInput(value: string | undefined): string | null {
  if (!value || !DATE_RE.test(value)) return null;
  const ms = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10);
}

/** The UTC calendar day for a UTC instant. Used only for pure date-string
 * arithmetic on UTC-midnight anchors (which is timezone-neutral). */
function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** The IST (Asia/Kolkata) calendar day for a UTC instant, `YYYY-MM-DD`.
 * Equivalent to Postgres `(created_at at time zone 'Asia/Kolkata')::date`. */
function istDay(ms: number): string {
  return new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * Parse `?from=&to=` search params into a normalized range. Defaults to the last
 * 30 days (inclusive, ending today in IST). Bad / missing input falls back to the
 * default; if `from` is after `to` they are swapped. No date library — native Date.
 * Boundaries are IST midnights (see `DateRange`).
 */
export function parseRange(params: {
  from?: string;
  to?: string;
}): DateRange {
  const todayISO = istDay(Date.now());
  const defaultFromISO = isoDay(
    Date.parse(`${todayISO}T00:00:00.000Z`) - 29 * MS_PER_DAY,
  );

  let fromISO = normalizeDateInput(params.from) ?? defaultFromISO;
  let toISO = normalizeDateInput(params.to) ?? todayISO;

  if (Date.parse(`${fromISO}T00:00:00.000Z`) > Date.parse(`${toISO}T00:00:00.000Z`)) {
    [fromISO, toISO] = [toISO, fromISO];
  }

  // Midnight IST of the day AFTER toISO, as the exclusive upper bound.
  const toExclusiveDay = isoDay(Date.parse(`${toISO}T00:00:00.000Z`) + MS_PER_DAY);

  return {
    fromISO,
    toISO,
    fromIso8601: `${fromISO}T00:00:00.000+05:30`,
    toExclusiveIso8601: `${toExclusiveDay}T00:00:00.000+05:30`,
  };
}

/** Every IST calendar day from `fromISO` to `toISO` inclusive. (Pure date-string
 * iteration over UTC-midnight anchors — the anchors are timezone-neutral here.) */
function dayBuckets(range: DateRange): string[] {
  const out: string[] = [];
  const end = Date.parse(`${range.toISO}T00:00:00.000Z`);
  for (
    let ms = Date.parse(`${range.fromISO}T00:00:00.000Z`);
    ms <= end;
    ms += MS_PER_DAY
  ) {
    out.push(isoDay(ms));
  }
  return out;
}

/** Orders revenue/count/AOV + gap-filled daily series over the range. Live data. */
async function computeOrdersMetrics(range: DateRange): Promise<OrdersMetrics> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("status, total_paise, created_at")
    .gte("created_at", range.fromIso8601)
    .lt("created_at", range.toExclusiveIso8601);

  if (error) throw new Error(`Failed to aggregate orders: ${error.message}`);

  // Seed every day in range at zero so the chart has no gaps.
  const byDay = new Map<string, { revenuePaise: number; orders: number }>();
  for (const day of dayBuckets(range)) {
    byDay.set(day, { revenuePaise: 0, orders: 0 });
  }

  let revenuePaise = 0;
  let paidOrders = 0;

  for (const row of data ?? []) {
    if (!PAID_SET.has(row.status)) continue; // revenue = paid orders only
    revenuePaise += row.total_paise;
    paidOrders += 1;
    if (!row.created_at) continue;
    const key = istDay(Date.parse(row.created_at)); // IST day, matches the buckets
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.revenuePaise += row.total_paise;
      bucket.orders += 1;
    }
  }

  const series: RevenueSeriesPoint[] = [...byDay.entries()].map(
    ([date, v]) => ({ date, revenuePaise: v.revenuePaise, orders: v.orders }),
  );

  return {
    revenuePaise,
    paidOrders,
    aovPaise: paidOrders > 0 ? Math.round(revenuePaise / paidOrders) : null,
    series,
  };
}

/**
 * Distinct sessions + top pages from `pageviews`. Real read path; returns
 * 0 / [] today (table empty until feature 22). One fetch, reduced in JS.
 */
async function computeTrafficMetrics(range: DateRange): Promise<TrafficMetrics> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pageviews")
    .select("session_id, path")
    .gte("created_at", range.fromIso8601)
    .lt("created_at", range.toExclusiveIso8601)
    .limit(PAGEVIEW_FETCH_CAP);

  if (error) throw new Error(`Failed to read pageviews: ${error.message}`);

  const rows = data ?? [];
  if (rows.length === PAGEVIEW_FETCH_CAP) {
    // Surfaced, not silently truncated. See PAGEVIEW_FETCH_CAP note above.
    console.warn(
      `[analytics] pageview fetch hit cap (${PAGEVIEW_FETCH_CAP}); distinct/top-page counts are partial — move to a DB-side aggregate.`,
    );
  }

  const sessions = new Set<string>();
  const pathCounts = new Map<string, number>();
  for (const row of rows) {
    if (row.session_id) sessions.add(row.session_id);
    if (row.path) pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
  }

  const topPages = [...pathCounts.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return {
    distinctSessions: sessions.size,
    totalPageviews: rows.length,
    topPages,
  };
}

/** Abandoned-cart count from `carts`. Real read path; 0 until feature 18 lands. */
async function computeCartMetrics(range: DateRange): Promise<CartMetrics> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("carts")
    .select("id", { count: "exact", head: true })
    .in("status", ABANDONED_CART_STATUSES as unknown as string[])
    .gte("created_at", range.fromIso8601)
    .lt("created_at", range.toExclusiveIso8601);

  if (error) throw new Error(`Failed to count carts: ${error.message}`);
  return { abandoned: count ?? 0 };
}

/**
 * Compute the full analytics summary for a range. One service-role round trip per
 * source, run concurrently. Conversion guards its denominator: 0 sessions → null.
 */
export async function computeAnalytics(
  range: DateRange,
): Promise<AnalyticsSummary> {
  const [orders, traffic, carts] = await Promise.all([
    computeOrdersMetrics(range),
    computeTrafficMetrics(range),
    computeCartMetrics(range),
  ]);

  const conversionRate =
    traffic.distinctSessions > 0
      ? orders.paidOrders / traffic.distinctSessions
      : null;

  return { range, orders, traffic, carts, conversionRate };
}
