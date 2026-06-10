import "server-only";

/**
 * WhatsApp lead messages — FORWARD STUB for feature 10.
 *
 * This file is the clearly-marked hook the feature-9 spec asks for: it SENDS
 * NOTHING today. When feature 10 (Interakt/AiSensy + approved templates) lands,
 * the real provider call goes here behind `WHATSAPP_API_KEY`, mirroring the
 * dormant-email pattern (`lib/email/*`) — non-fatal, logged, never throws.
 *
 * Both functions return a typed "stub" result so callers can treat them exactly
 * like the eventual real send (which will return sent:true/false) with no change
 * at the call site.
 */

export type WhatsAppStubResult = { sent: false; reason: "stub" };

/** Instant "here's your 10% code" message. Gated on consent at the call site. */
export async function sendLeadWelcomeWhatsApp(input: {
  phone: string;
  name: string | null;
  code: string;
}): Promise<WhatsAppStubResult> {
  // FORWARD STUB (feature 10) — send nothing; just record intent.
  console.info(
    `[whatsapp][stub] lead welcome — would send code ${input.code} to ${input.phone} (feature 10)`,
  );
  return { sent: false, reason: "stub" };
}

/** The single 48h follow-up nudge. Called once per lead from the cron route. */
export async function sendLeadFollowupWhatsApp(input: {
  phone: string;
  name: string | null;
  code: string;
}): Promise<WhatsAppStubResult> {
  // FORWARD STUB (feature 10) — send nothing; just record intent.
  console.info(
    `[whatsapp][stub] lead 48h follow-up — would nudge ${input.phone} with code ${input.code} (feature 10)`,
  );
  return { sent: false, reason: "stub" };
}
