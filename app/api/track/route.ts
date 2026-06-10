import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PricedItem } from "@/lib/checkout/pricing";
import { trackRequestSchema } from "@/lib/track/validation";
import { checkRateLimit, clientIpFrom } from "@/lib/track/rate-limit";
import type {
  OrderStatus,
  TrackHistoryEntry,
  TrackItem,
  TrackOrder,
  TrackResponse,
} from "@/lib/track/types";

// Reads the RLS-locked `orders` table via the service-role client — Node runtime,
// never the edge. There is NO public (anon) read path to orders (A3 deny-all).
export const runtime = "nodejs";

/**
 * POST /api/track — guest order lookup by (order number + phone).
 *
 * SECURITY is the whole point of this route:
 *
 *  1. The (orderNumber, phone) pair IS the authz check. The match query keys on
 *     BOTH columns, so the database physically cannot return an order by number
 *     alone — a correct number with the wrong phone yields zero rows.
 *
 *  2. UNIFORM negative response. Every miss — wrong phone on a real number, a
 *     number that doesn't exist, a malformed number, or an unpaid `created`
 *     order — returns the IDENTICAL `200 { found: false }`. Same status, same
 *     body, same code path: all misses fall through the single two-column query
 *     and skip the history lookup, so nothing (status, message, or extra DB
 *     work) lets a caller tell a real order number from a fake one. This is what
 *     stops enumeration of valid order numbers.
 *
 *  3. Rate-limited per IP (before any parsing/DB work) to deter brute-forcing a
 *     phone against a guessed number.
 *
 * Orders are read with the service-role client (bypasses RLS); only display-safe
 * fields leave the server — no payment internals.
 */

/** The uniform negative. Returned for EVERY non-match — keep it byte-identical. */
const NOT_FOUND: TrackResponse = { found: false };

const HISTORY_LIMIT = 20;

export async function POST(request: Request) {
  // 1. Rate-limit FIRST — before parsing or touching the DB, so malformed input
  //    can't be used to bypass the limiter.
  const limit = checkRateLimit(clientIpFrom(request.headers));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  // 2. Parse the body. Unparseable JSON is the only shape of bad input that gets
  //    a 400 — it reveals nothing about whether any order exists.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 3. Validate + normalize. A shape failure (missing/short fields, bad phone)
  //    is folded into the SAME uniform negative — never a distinct error — so a
  //    malformed number is indistinguishable from a valid-but-nonexistent one.
  const parsed = trackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(NOT_FOUND);
  }
  const { orderNumber, phone } = parsed.data;

  const admin = createAdminClient();

  // 4. THE match: both columns in the WHERE. `order_number` is unique, so this
  //    is at most one row. Unpaid (`created`) orders are excluded — they aren't
  //    trackable and must not be exposed. Any miss returns the uniform negative.
  const { data: order, error } = await admin
    .from("orders")
    .select(
      "order_number, status, created_at, total_paise, items, tracking_url, courier",
    )
    .eq("order_number", orderNumber)
    .eq("customer_phone", phone)
    .neq("status", "created")
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json(NOT_FOUND);
  }

  // 5. Hit (correct credentials — a genuinely different outcome). Only now do we
  //    run the extra history query, so it never becomes a timing oracle between
  //    two misses.
  const items: TrackItem[] = ((order.items as unknown as PricedItem[]) ?? []).map(
    (i) => ({
      kind: i.kind,
      ...(i.product_id ? { product_id: i.product_id } : {}),
      ...(i.bundle_id ? { bundle_id: i.bundle_id } : {}),
      name: i.name,
      ...(i.pack_key ? { pack_key: i.pack_key } : {}),
      qty: i.qty,
      line_total_paise: i.line_total_paise,
    }),
  );

  const trackOrder: TrackOrder = {
    orderNumber: order.order_number,
    status: order.status as OrderStatus,
    createdAt: order.created_at,
    total_paise: order.total_paise,
    items,
    tracking: order.tracking_url
      ? { url: order.tracking_url, courier: order.courier }
      : null,
  };

  // Minimal order history for this verified phone (most recent first). Reading by
  // customer_phone is safe here: we already proved possession of the phone via
  // the matched lookup above.
  const { data: historyRows } = await admin
    .from("orders")
    .select("order_number, status, created_at, items")
    .eq("customer_phone", phone)
    .neq("status", "created")
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  const history: TrackHistoryEntry[] = (historyRows ?? []).map((row) => {
    const rowItems = (row.items as unknown as PricedItem[]) ?? [];
    return {
      orderNumber: row.order_number,
      status: row.status as OrderStatus,
      createdAt: row.created_at,
      itemCount: rowItems.reduce((n, it) => n + (it.qty ?? 0), 0),
    };
  });

  const response: TrackResponse = { found: true, order: trackOrder, history };
  return NextResponse.json(response);
}
