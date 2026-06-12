import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCartRecovery } from "@/lib/whatsapp";
import type { PricedItem } from "@/lib/checkout/pricing";

// Service-role reads/writes on the RLS-locked `carts` + `orders` tables.
export const runtime = "nodejs";

/**
 * GET /api/cron/cart-recovery — the single abandoned-cart nudge (feature 18).
 *
 * PROTECTED exactly like the lead-followup cron: NOT publicly invocable. It
 * requires `Authorization: Bearer ${CRON_SECRET}` — the header Vercel Cron sends
 * automatically. Two-layer fail-closed:
 *   - CRON_SECRET unset → the route refuses to run at all (503); it can never be
 *     live without an explicit secret.
 *   - Wrong/missing bearer → 401 before any DB work, so an attacker can't trigger
 *     sends or probe cart PII.
 *
 * What it does, once per eligible cart and NEVER again:
 *   - Selects `active` carts that have not been nudged (`recovery_sent = false`)
 *     and have been idle at least STALE_MS (`last_seen_at` past the threshold).
 *   - If that phone has since placed a PAID order, it RECONCILES the cart to
 *     `converted` and sends nothing — a backstop for the paid-time conversion
 *     flip in /confirm + the webhook.
 *   - Otherwise it CLAIMS the cart atomically (conditional `recovery_sent` flip
 *     to true + `status='abandoned'`, concurrent-run safe), then fires exactly
 *     one recovery message (non-fatal, fire-and-forget). The claim guarantees at
 *     most one nudge per cart even if the cron overlaps or retries.
 *
 * `recovery_sent` is the idempotency guard: a cart that already got a nudge is no
 * longer selected (and is `abandoned`, not `active`), so it never gets a second.
 */

/** Idle threshold: an `active` cart is recoverable once untouched this long. */
const STALE_MS = 4 * 60 * 60 * 1000;
/** Safety cap on how many carts one run will process. */
const BATCH = 500;

/** First line's product name for the message body, or a neutral fallback. */
function firstItemName(items: unknown): string {
  const list = Array.isArray(items) ? (items as PricedItem[]) : [];
  return list[0]?.name ?? "your cart";
}

export async function GET(request: Request) {
  const env = serverEnv();

  // 1. Fail closed when unconfigured — never runnable without a secret.
  if (!env.CRON_SECRET) {
    return NextResponse.json(
      { error: "Cron is not configured." },
      { status: 503 },
    );
  }

  // 2. Authenticate the bearer BEFORE any DB work.
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();
  const olderThan = new Date(Date.now() - STALE_MS).toISOString();

  // 3. Candidates: active, un-nudged carts idle past the threshold.
  const { data: candidates, error } = await admin
    .from("carts")
    .select("id, phone, items, recovery_sent")
    .eq("status", "active")
    .eq("recovery_sent", false)
    .lte("last_seen_at", olderThan)
    .limit(BATCH);

  if (error) {
    console.error("[cron] cart-recovery select failed:", error);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ scanned: 0, nudged: 0, reconciled: 0 });
  }

  // 4. Which of these phones already paid? (orders.status != 'created' = paid+).
  //    A paid order suppresses the nudge — reconcile the cart instead of sending.
  const phones = [
    ...new Set(candidates.map((c) => c.phone).filter((p): p is string => !!p)),
  ];
  const paidPhones = new Set<string>();
  if (phones.length > 0) {
    const { data: paid } = await admin
      .from("orders")
      .select("customer_phone")
      .in("customer_phone", phones)
      .neq("status", "created");
    for (const o of paid ?? []) paidPhones.add(o.customer_phone);
  }

  let nudged = 0;
  let reconciled = 0;

  for (const cart of candidates) {
    // 4a. Bought already → reconcile to converted and DON'T nudge. (Candidates
    //     all have recovery_sent=false, so the right terminal state is
    //     `converted`.) Guarded on still-active so a concurrent flip wins once.
    if (cart.phone && paidPhones.has(cart.phone)) {
      await admin
        .from("carts")
        .update({ status: "converted" })
        .eq("id", cart.id)
        .eq("status", "active");
      reconciled += 1;
      continue;
    }

    // 4b. Claim the single nudge atomically: flip recovery_sent→true and
    //     status→abandoned, conditional on recovery_sent still being false. The
    //     conditional update wins for at most one runner; a concurrent/overlapping
    //     run updates 0 rows and skips. This is the idempotency guard.
    const { data: claimed, error: claimError } = await admin
      .from("carts")
      .update({ recovery_sent: true, status: "abandoned" })
      .eq("id", cart.id)
      .eq("recovery_sent", false)
      .select("id");

    if (claimError || !claimed || claimed.length === 0) continue;

    // 4c. Exactly one recovery message — WhatsApp via the facade (TRANSACTIONAL;
    //     the shopper entered their phone to buy, so not consent-gated). Dormant
    //     until WHATSAPP_API_KEY, non-fatal, fire-and-forget.
    if (cart.phone) {
      void sendCartRecovery({
        phone: cart.phone,
        item: firstItemName(cart.items),
      });
    }
    nudged += 1;
  }

  return NextResponse.json({
    scanned: candidates.length,
    nudged,
    reconciled,
  });
}
