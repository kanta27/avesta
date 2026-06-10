import "server-only";
import type {
  TemplateVars,
  WhatsAppProvider,
  WhatsAppSendResult,
  WhatsAppTemplate,
} from "./types";

/**
 * Dormant WhatsApp provider. Server-only.
 *
 * Selected by the facade whenever `WHATSAPP_API_KEY` is absent — in EVERY
 * environment, including production. This is the deliberate difference from the
 * payment abstraction: payments THROW in production without keys (a paid order
 * must never silently mock), but WhatsApp is non-critical, so a missing key is a
 * normal degraded mode, not a misconfiguration. It logs intent and returns a
 * non-fatal `no-key` result so the order / lead / cron path is unaffected.
 *
 * When `WHATSAPP_API_KEY` is later set, the facade selects the real
 * Interakt/AiSensy provider instead and this module is no longer reached — no
 * code change at any call site.
 */
export const dormantProvider: WhatsAppProvider = {
  name: "dormant",

  async sendTemplate(
    name: WhatsAppTemplate,
    phone: string,
    vars: TemplateVars,
  ): Promise<WhatsAppSendResult> {
    console.info(
      `[whatsapp] would send ${name} to ${phone} with ${JSON.stringify(vars)}`,
    );
    return { sent: false, reason: "no-key" };
  },
};
