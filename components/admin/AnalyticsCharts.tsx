"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPaiseINR } from "@/lib/format";

/**
 * Analytics time-series charts (feature 13) — a `"use client"` island fed ONLY
 * the server-computed, serializable `series`. It must NOT import the analytics
 * compute module (`lib/analytics/admin.ts`, server-only) — so the point shape is
 * declared locally here rather than imported, keeping the service-role client
 * out of the browser bundle. `lib/format` is pure/client-safe.
 */

/** Mirror of `RevenueSeriesPoint` from the server module — declared locally on purpose. */
interface ChartPoint {
  date: string;
  revenuePaise: number;
  orders: number;
}

/** "2026-06-11" → "11 Jun" (UTC, matching server-side bucketing). */
function shortDay(iso: string): string {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function fullDay(iso: string): string {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const AXIS_TICK = { fontSize: 11, fill: "var(--grey)" } as const;

export function AnalyticsCharts({ series }: { series: ChartPoint[] }) {
  const hasData = series.some((p) => p.orders > 0 || p.revenuePaise > 0);

  if (!hasData) {
    return (
      <div className="rounded-card border border-line bg-paper-2 px-5 py-10 text-center text-sm text-grey">
        No paid orders in this range yet.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <figure className="rounded-card border border-line bg-paper-2 px-4 py-4">
        <figcaption className="mb-2 px-1 font-mono text-xs uppercase tracking-widest text-grey">
          Revenue per day
        </figcaption>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ink)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--ink)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDay}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: "var(--line)" }}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v: number) => formatPaiseINR(v)}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value) => [formatPaiseINR(Number(value)), "Revenue"]}
                labelFormatter={(label) => fullDay(String(label))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenuePaise"
                stroke="var(--ink)"
                strokeWidth={2}
                fill="url(#revFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </figure>

      <figure className="rounded-card border border-line bg-paper-2 px-4 py-4">
        <figcaption className="mb-2 px-1 font-mono text-xs uppercase tracking-widest text-grey">
          Paid orders per day
        </figcaption>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDay}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: "var(--line)" }}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                formatter={(value) => [String(value), "Orders"]}
                labelFormatter={(label) => fullDay(String(label))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="orders" fill="var(--lime-deep)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}
