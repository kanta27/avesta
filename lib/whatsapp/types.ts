/**
 * WhatsApp abstraction — the interface every provider implements.
 *
 * This file is dependency-free and carries no secrets, so it is safe to import
 * from anywhere (the concrete providers and `index.ts` are `server-only`). The
 * rest of the app talks only to the typed helpers in `./index`, never to a
 * provider or to a provider HTTP endpoint directly — swapping Interakt ↔ AiSensy
 * is a one-env change (`WHATSAPP_PROVIDER`) plus the matching `*.provider.ts`.
 *
 * WhatsApp business-initiated messages REQUIRE pre-approved templates, so the
 * provider seam is template-oriented: `sendTemplate(name, phone, vars)`. The
 * template `name` must match a template approved in the provider console; `vars`
 * fills its placeholders.
 *
 * Sends are NON-FATAL everywhere (conventions.md): a missing key, a skipped
 * send, or a provider error must never throw and never fail the order, the lead
 * capture, or the cron. The result type encodes the outcome instead of throwing.
 */

/**
 * The approved templates this app sends. Adding a new business message means
 * adding it here AND getting the template approved in the provider console.
 *   - order_confirmation / order_shipped / review_request → TRANSACTIONAL
 *                                          (purchase-tied; not consent-gated).
 *   - lead_welcome / lead_followup       → MARKETING (consent-gated at call site).
 */
export type WhatsAppTemplate =
  | "order_confirmation"
  | "order_shipped"
  | "review_request"
  | "lead_welcome"
  | "lead_followup";

/**
 * The outcome of a send attempt. Never an exception — callers fire-and-forget.
 *   - `no-key`  → dormant: no `WHATSAPP_API_KEY`, the dormant provider logged it.
 *   - `skipped` → deliberately not sent (e.g. no phone on the order/lead).
 *   - `error`   → a real provider attempt failed; logged, swallowed, non-fatal.
 */
export type WhatsAppSendResult =
  | { sent: true }
  | { sent: false; reason: "no-key" | "skipped" | "error" };

/** Template placeholder values. All stringified at the edge before sending. */
export type TemplateVars = Record<string, string>;

/**
 * A swappable WhatsApp gateway. Implementations live in `*.provider.ts` and are
 * selected in `index.ts`; callers never reference them directly. Implementations
 * MUST NOT throw — they resolve to a `WhatsAppSendResult` in every case.
 */
export interface WhatsAppProvider {
  /** Human-readable provider id, for logging/diagnostics (e.g. "interakt"). */
  readonly name: string;

  /**
   * Send a pre-approved template to a phone with its placeholder values.
   * `phone` is the customer/lead phone as stored (10-digit normalized; the
   * provider prepends the country code). Resolves to a result, never throws.
   */
  sendTemplate(
    name: WhatsAppTemplate,
    phone: string,
    vars: TemplateVars,
  ): Promise<WhatsAppSendResult>;
}
