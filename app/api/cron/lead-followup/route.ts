import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WELCOME_CODE } from "@/lib/leads/welcome-code";
import { sendLeadFollowupWhatsApp } from "@/lib/whatsapp/lead";
import { sendLeadFollowupEmail } from "@/lib/email/lead-welcome";

// Service-role reads/writes on the RLS-locked `leads` + `orders` tables.
export const runtime = "nodejs";

/**
 * GET /api/cron/lead-followup — the 48h lead nudge (feature 9).
 *
 * PROTECTED: this route is NOT publicly invocable. It requires
 * `Authorization: Bearer ${CRON_SECRET}` — the header Vercel Cron sends
 * automatically. Two-layer fail-closed:
 *   - If CRON_SECRET is unset, the route refuses to run at all (503) — it can
 *     never be live without an explicit secret.
 *   - Any request whose bearer doesn't match is rejected (401) before any DB
 *     work, so an attacker can't trigger sends or probe lead data.
 *
 * What it does, once per eligible lead and NEVER again:
 *   - Selects CONSENTED (`consent_whatsapp = true`) popup leads ~48h–14d old that
 *     are not converted and have no follow-up recorded. Only consented leads ever
 *     enter the marketing follow-up (DPDP).
 *   - If that phone has since placed a paid order, it RECONCILES (flips converted,
 *     records the order) and sends nothing — a backstop for the paid-time flip.
 *   - Otherwise it CLAIMS the lead atomically (conditional `followup_sent_at`
 *     update, concurrent-run safe), then fires exactly one reminder (WhatsApp
 *     stub + dormant email, both non-fatal). The claim guarantees at most one
 *     nudge even if the cron overlaps or retries.
 */

/** Lower bound so a long-dormant or pre-feature lead isn't suddenly nudged. */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
/** Eligibility threshold: a lead must be at least this old. */
const MIN_AGE_MS = 48 * 60 * 60 * 1000;
/** Safety cap on how many leads one run will process. */
const BATCH = 500;

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
  const now = Date.now();
  const olderThan = new Date(now - MIN_AGE_MS).toISOString();
  const newerThan = new Date(now - MAX_AGE_MS).toISOString();

  // 3. Candidates: consented, unconverted, un-nudged popup leads in the window.
  const { data: candidates, error } = await admin
    .from("leads")
    .select("id, phone, name, email")
    .eq("source_type", "popup")
    .eq("converted", false)
    .eq("consent_whatsapp", true)
    .is("followup_sent_at", null)
    .lte("created_at", olderThan)
    .gte("created_at", newerThan)
    .limit(BATCH);

  if (error) {
    console.error("[cron] lead-followup select failed:", error);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ scanned: 0, nudged: 0, reconciled: 0 });
  }

  // 4. Which of these phones already paid? (status != 'created' = paid+). Build
  //    phone → most-recent paid order id so a buyer is reconciled, not nudged.
  const phones = [
    ...new Set(candidates.map((c) => c.phone).filter((p): p is string => !!p)),
  ];
  const paidByPhone = new Map<string, string>();
  if (phones.length > 0) {
    const { data: paid } = await admin
      .from("orders")
      .select("customer_phone, id, created_at")
      .in("customer_phone", phones)
      .neq("status", "created")
      .order("created_at", { ascending: false });
    for (const o of paid ?? []) {
      if (!paidByPhone.has(o.customer_phone)) {
        paidByPhone.set(o.customer_phone, o.id);
      }
    }
  }

  let nudged = 0;
  let reconciled = 0;

  for (const lead of candidates) {
    const paidOrderId = lead.phone ? paidByPhone.get(lead.phone) : undefined;

    // 4a. Bought already → reconcile and DON'T nudge.
    if (paidOrderId) {
      await admin
        .from("leads")
        .update({ converted: true, converted_order_id: paidOrderId })
        .eq("id", lead.id)
        .eq("converted", false);
      reconciled += 1;
      continue;
    }

    // 4b. Claim the single nudge atomically. The conditional update wins for at
    //     most one runner; a concurrent/overlapping run updates 0 rows and skips.
    const { data: claimed, error: claimError } = await admin
      .from("leads")
      .update({ followup_sent_at: new Date(now).toISOString() })
      .eq("id", lead.id)
      .is("followup_sent_at", null)
      .select("id");

    if (claimError || !claimed || claimed.length === 0) continue;

    // 4c. Exactly one reminder — stubs/dormant, both non-fatal (fire-and-forget).
    if (lead.phone) {
      void sendLeadFollowupWhatsApp({
        phone: lead.phone,
        name: lead.name,
        code: WELCOME_CODE,
      });
    }
    void sendLeadFollowupEmail({
      email: lead.email,
      name: lead.name,
      code: WELCOME_CODE,
    });
    nudged += 1;
  }

  return NextResponse.json({
    scanned: candidates.length,
    nudged,
    reconciled,
  });
}
