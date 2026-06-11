import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIpFrom } from "@/lib/track/rate-limit";
import { leadRequestSchema } from "@/lib/leads/validation";
import { WELCOME_CODE } from "@/lib/leads/welcome-code";
import { sendLeadWelcome } from "@/lib/whatsapp";
import { sendLeadWelcomeEmail } from "@/lib/email/lead-welcome";

// Writes the RLS-locked `leads` table via the service-role client — `leads` is
// deny-all to anon (A3), so the ONLY write path is this trusted server route.
// Node runtime: service-role client + node fetch for the (dormant) sends.
export const runtime = "nodejs";

/**
 * POST /api/leads — capture a marketing lead from the popup or footer newsletter.
 *
 * Security / privacy posture (spec + conventions.md):
 *   - Rate-limited per IP FIRST (reuses the feature-7 limiter) so the public
 *     endpoint can't be flooded with junk rows.
 *   - Validated + normalized server-side (10-digit phone, valid email) before any
 *     DB work — unknown keys are stripped by zod.
 *   - Written with the service-role client because `leads` is RLS deny-all; the
 *     client can NEVER write directly.
 *   - DPDP: `consent_whatsapp` is stored exactly as sent (unticked → false), and
 *     `consent_at` is set ONLY when consent is true.
 *   - Dedupe: a repeat submit from the same identity + source doesn't pile up rows
 *     — we still return the same success so the UX is identical.
 *   - Instant WhatsApp/email are best-effort and NON-FATAL: a failed send must
 *     never fail the capture. WhatsApp routes through the lib/whatsapp facade
 *     (feature 10), dormant until WHATSAPP_API_KEY; email is dormant until
 *     EMAIL_API_KEY (feature 6 pattern).
 *
 * Consumer sources (popup/newsletter) return `{ code }` — the ONE shared WELCOME
 * code, revealed on-screen. The B2B arm (feature 15) is NOT consumer acquisition:
 * it reveals NO discount code and fires NO welcome send — it returns a plain ack
 * (`{ ok, message }`) and parks the org/volume/message in the `quiz_answers` jsonb
 * for the team to read in the admin Leads module.
 */
export async function POST(request: Request) {
  // 1. Rate-limit before parsing or touching the DB.
  const limit = checkRateLimit(clientIpFrom(request.headers));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  // 2. Parse the body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 3. Validate + normalize. A shape failure returns a clear 400.
  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid details.";
    return NextResponse.json({ error: first }, { status: 400 });
  }
  const lead = parsed.data;
  const name = lead.name?.trim() ? lead.name.trim() : null;
  const phone = "phone" in lead && lead.phone ? lead.phone : null;

  const admin = createAdminClient();

  // 4. Dedupe repeat submits. Match on the strongest identity we have for this
  //    source — phone when present (popup), else email (newsletter). If a row
  //    already exists we skip the insert but still return the code, so a repeat
  //    submitter sees the same success without stacking duplicate rows.
  let dupeQuery = admin
    .from("leads")
    .select("id")
    .eq("source_type", lead.source_type)
    .limit(1);
  dupeQuery = phone
    ? dupeQuery.eq("phone", phone)
    : dupeQuery.eq("email", lead.email);
  const { data: existing } = await dupeQuery.maybeSingle();

  // B2B extras (org type / volume / free-text message) ride along in the
  // `quiz_answers` jsonb catch-all — no dedicated columns needed (A2). Null for
  // every other source so the column stays meaningful.
  const quizAnswers =
    lead.source_type === "b2b"
      ? { org_type: lead.org_type, volume: lead.volume, message: lead.message ?? null }
      : null;

  if (!existing) {
    // 5. Insert. consent_at is meaningful only when consent was given.
    const { error: insertError } = await admin.from("leads").insert({
      name,
      phone,
      email: lead.email,
      source_page: lead.source_page ?? null,
      source_type: lead.source_type,
      consent_whatsapp: lead.consent,
      consent_at: lead.consent ? new Date().toISOString() : null,
      quiz_answers: quizAnswers,
    });

    if (insertError) {
      console.error("[lead] insert failed:", insertError);
      return NextResponse.json(
        { error: "Could not save your details. Please try again." },
        { status: 500 },
      );
    }
  }

  // 6. B2B is a wholesale enquiry, not consumer acquisition (feature 15): reveal
  //    NO discount code and fire NO welcome send. Acknowledge plainly — the team
  //    follows up from the admin Leads module.
  if (lead.source_type === "b2b") {
    return NextResponse.json({
      ok: true,
      message: "Thanks — we've received your enquiry. Our team will be in touch.",
    });
  }

  // 7. Instant delivery of the code — ONLY for the popup offer (the newsletter is
  //    a plain subscribe, not the 10%-code mechanic). Best-effort and NON-FATAL:
  //    a failed send never fails the capture. WhatsApp only when the visitor opted
  //    in (the checkbox authorizes WhatsApp specifically) — the consent gate for
  //    the MARKETING send; the email fulfils the code they explicitly asked for.
  //    Both are dormant today (no provider keys).
  if (lead.source_type === "popup") {
    if (lead.consent && phone) {
      void sendLeadWelcome({ phone, code: WELCOME_CODE });
    }
    void sendLeadWelcomeEmail({ email: lead.email, name, code: WELCOME_CODE });
  }

  // 8. Reveal the shared code (popup + newsletter).
  return NextResponse.json({ code: WELCOME_CODE });
}
