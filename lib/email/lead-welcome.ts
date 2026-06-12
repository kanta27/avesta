import "server-only";

import { serverEnv } from "@/lib/env.server";

/**
 * Lead "here's your 10% code" email — built but DORMANT until `EMAIL_API_KEY` is
 * set, identical contract to the receipt email (`lib/email/receipt.ts`):
 *
 *   - No key  → log "skipped (no key)" and return; the lead capture is unaffected.
 *   - Key set → the REAL Resend send path runs untouched. Adding the env var alone
 *     makes welcome emails go live — no code change.
 *   - NEVER throws. Any failure is caught and logged; a failed send must never
 *     fail the lead capture (conventions.md — sends are non-fatal).
 */
export type LeadEmailResult =
  | { sent: false; reason: "no-key" | "no-recipient" | "error" }
  | { sent: true };

export async function sendLeadWelcomeEmail(input: {
  email: string;
  name: string | null;
  code: string;
}): Promise<LeadEmailResult> {
  try {
    const env = serverEnv();

    if (!env.EMAIL_API_KEY) {
      console.info(`[lead] welcome email skipped (no key) — ${input.email}`);
      return { sent: false, reason: "no-key" };
    }
    if (!input.email) {
      return { sent: false, reason: "no-recipient" };
    }

    // --- REAL SEND (dormant until EMAIL_API_KEY is present) -------------------
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.EMAIL_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: "Avesta Nordic <hello@avestahealth.in>",
        to: input.email,
        subject: "Your 10% welcome code 🎉",
        html: renderWelcomeHtml(input.name, input.code),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[lead] welcome email provider error (${res.status}) — ${input.email}: ${detail}`,
      );
      return { sent: false, reason: "error" };
    }

    console.info(`[lead] welcome email sent — ${input.email}`);
    return { sent: true };
  } catch (err) {
    console.error(`[lead] welcome email threw (non-fatal) — ${input.email}:`, err);
    return { sent: false, reason: "error" };
  }
}

/**
 * The single 48h follow-up reminder email. Same dormant contract as the welcome
 * send above (no key → skipped, never throws). Called once per lead from the
 * cron route, only for consented leads who haven't purchased.
 */
export async function sendLeadFollowupEmail(input: {
  email: string | null;
  name: string | null;
  code: string;
}): Promise<LeadEmailResult> {
  try {
    const env = serverEnv();

    if (!env.EMAIL_API_KEY) {
      console.info(`[lead] follow-up email skipped (no key) — ${input.email}`);
      return { sent: false, reason: "no-key" };
    }
    if (!input.email) {
      return { sent: false, reason: "no-recipient" };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.EMAIL_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: "Avesta Nordic <hello@avestahealth.in>",
        to: input.email,
        subject: "Still thinking it over? Your 10% code is waiting",
        html: renderFollowupHtml(input.name, input.code),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[lead] follow-up email provider error (${res.status}) — ${input.email}: ${detail}`,
      );
      return { sent: false, reason: "error" };
    }

    console.info(`[lead] follow-up email sent — ${input.email}`);
    return { sent: true };
  } catch (err) {
    console.error(`[lead] follow-up email threw (non-fatal) — ${input.email}:`, err);
    return { sent: false, reason: "error" };
  }
}

/** Minimal, dependency-free welcome email body. */
function renderWelcomeHtml(name: string | null, code: string): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0A3D3F">
  <h2>Welcome to the Avesta Nordic circle</h2>
  <p>${greeting}</p>
  <p>Here's your code for <strong>10% off your first order</strong>:</p>
  <p style="font-size:22px;font-weight:bold;letter-spacing:1px;color:#0A3D3F">${escapeHtml(code)}</p>
  <p>Apply it at checkout. Science-backed hydration &amp; nutrition, on its way.</p>
  <p style="color:#5C6B68;font-size:13px">These products are not intended to diagnose, treat, cure or prevent any disease.</p>
  </body></html>`;
}

/** The 48h reminder body — one nudge, same code. */
function renderFollowupHtml(name: string | null, code: string): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0A3D3F">
  <h2>Your 10% code is still waiting</h2>
  <p>${greeting}</p>
  <p>A quick reminder — your code for <strong>10% off your first order</strong> is ready whenever you are:</p>
  <p style="font-size:22px;font-weight:bold;letter-spacing:1px;color:#0A3D3F">${escapeHtml(code)}</p>
  <p>Apply it at checkout. Science-backed hydration &amp; nutrition, on its way.</p>
  <p style="color:#5C6B68;font-size:13px">These products are not intended to diagnose, treat, cure or prevent any disease.</p>
  </body></html>`;
}

/** Escape user-controlled strings before interpolating into the email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
