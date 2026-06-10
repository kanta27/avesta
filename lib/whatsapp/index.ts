import "server-only";
import { serverEnv } from "@/lib/env.server";
import { formatPaiseINR } from "@/lib/format";
import { aisensyProvider } from "./aisensy.provider";
import { dormantProvider } from "./dormant.provider";
import { interaktProvider } from "./interakt.provider";
import type {
  TemplateVars,
  WhatsAppProvider,
  WhatsAppSendResult,
  WhatsAppTemplate,
} from "./types";

/**
 * WhatsApp facade. Server-only.
 *
 * This is the single seam the rest of the app imports — callers use the typed
 * message helpers below and never touch a provider file or a provider endpoint.
 * Swapping Interakt ↔ AiSensy is a one-env change (`WHATSAPP_PROVIDER`); no call
 * site changes.
 *
 * Selection (NON-CRITICAL — never throws, unlike the payment facade):
 *   - No `WHATSAPP_API_KEY` → the dormant provider, in EVERY environment
 *     including production. WhatsApp is non-critical: a missing key is a normal
 *     degraded mode (log intent, send nothing), NOT a misconfiguration. This is
 *     the deliberate difference from `lib/payments`, which throws in production.
 *   - Key set → `interakt` or `aisensy` per `WHATSAPP_PROVIDER`.
 *
 * NON-FATAL CONTRACT: every helper here resolves to a `WhatsAppSendResult` and
 * NEVER throws — a failed or skipped send must never fail the order, the lead
 * capture, or the cron. Callers fire-and-forget (`void sendX(...)`).
 *
 * CONSENT: marketing helpers (`sendLeadWelcome`, `sendLeadFollowup`) are gated on
 * `consent_whatsapp` at their CALL SITES (the leads route checks consent before
 * calling; the cron query only selects consented leads). Transactional helpers
 * (`sendOrderConfirmation`, `sendShippedNotification`) are purchase-tied and are
 * NOT gated on marketing consent.
 */

export type {
  TemplateVars,
  WhatsAppProvider,
  WhatsAppSendResult,
  WhatsAppTemplate,
} from "./types";

export function getWhatsAppProvider(): WhatsAppProvider {
  const env = serverEnv();

  // No key → dormant in ALL environments. Never throws (non-critical).
  if (!env.WHATSAPP_API_KEY) return dormantProvider;

  // Key present → the configured real provider. One-env swap.
  return env.WHATSAPP_PROVIDER === "aisensy" ? aisensyProvider : interaktProvider;
}

/**
 * Low-level send used by every helper below. Wraps the provider call so the
 * facade NEVER throws even if a provider somehow does — defense in depth on top
 * of the providers' own non-fatal contract.
 */
async function send(
  name: WhatsAppTemplate,
  phone: string | null,
  vars: TemplateVars,
): Promise<WhatsAppSendResult> {
  // No phone → nothing to send to (phone is optional on orders/leads).
  if (!phone) {
    console.info(`[whatsapp] ${name} skipped (no phone)`);
    return { sent: false, reason: "skipped" };
  }
  try {
    return await getWhatsAppProvider().sendTemplate(name, phone, vars);
  } catch (err) {
    console.error(`[whatsapp] ${name} send threw (non-fatal) — ${phone}:`, err);
    return { sent: false, reason: "error" };
  }
}

// --- Typed message helpers the app imports (never a provider directly) -------

/** The slice of an order needed for the order-confirmation template. */
export interface WhatsAppOrderConfirmation {
  order_number: string;
  total_paise: number;
  customer_phone: string | null;
}

/** The slice of an order needed for the shipped template. */
export interface WhatsAppShippedNotification {
  order_number: string;
  customer_phone: string | null;
  courier: string | null;
  tracking_url: string | null;
}

/**
 * TRANSACTIONAL — order confirmation on the created→paid transition. Fired from
 * `lib/receipts/order-confirmation.ts`, regardless of marketing consent.
 */
export function sendOrderConfirmation(
  order: WhatsAppOrderConfirmation,
): Promise<WhatsAppSendResult> {
  return send("order_confirmation", order.customer_phone, {
    order_number: order.order_number,
    total: formatPaiseINR(order.total_paise),
  });
}

/**
 * TRANSACTIONAL — shipped + tracking notification. Built and callable/testable
 * now, but its trigger (admin "mark shipped") is FEATURE 12 — it will be wired
 * to the admin action then. Not gated on marketing consent.
 */
export function sendShippedNotification(
  order: WhatsAppShippedNotification,
): Promise<WhatsAppSendResult> {
  return send("order_shipped", order.customer_phone, {
    order_number: order.order_number,
    courier: order.courier ?? "",
    tracking_url: order.tracking_url ?? "",
  });
}

/**
 * MARKETING — instant "here's your 10% code" welcome. CONSENT-GATED at the call
 * site: the leads route only calls this when `consent_whatsapp` is true.
 */
export function sendLeadWelcome(input: {
  phone: string;
  code: string;
}): Promise<WhatsAppSendResult> {
  return send("lead_welcome", input.phone, { code: input.code });
}

/**
 * MARKETING — the single 48h follow-up nudge. CONSENT-GATED at the call site:
 * the cron only selects leads with `consent_whatsapp = true`.
 */
export function sendLeadFollowup(input: {
  phone: string;
  code: string;
}): Promise<WhatsAppSendResult> {
  return send("lead_followup", input.phone, { code: input.code });
}
