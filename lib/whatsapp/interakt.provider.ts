import "server-only";
import { serverEnv } from "@/lib/env.server";
import type {
  TemplateVars,
  WhatsAppProvider,
  WhatsAppSendResult,
  WhatsAppTemplate,
} from "./types";

/**
 * Interakt implementation of `WhatsAppProvider`. Server-only.
 *
 * This is one of only two modules in the app allowed to reference a WhatsApp
 * provider endpoint (the other is `aisensy.provider.ts`) — everything else goes
 * through the facade in `./index`. The key is read from the validated server env
 * at call time and never reaches the client.
 *
 * DORMANT until `WHATSAPP_API_KEY` is set: the facade only selects this provider
 * once a key exists, so the real send path below is wired but inert today. When
 * the key + approved Interakt templates are added, this goes live untouched.
 *
 * NON-FATAL: every path resolves to a `WhatsAppSendResult` and NEVER throws — a
 * provider/network failure must not fail the order, lead capture, or cron.
 *
 * Interakt's WhatsApp template API expects the recipient split into country code
 * + national number and template placeholders as an ordered `bodyValues` array.
 * The ordering helper below keeps that mapping in one place.
 */

/** Interakt's public message endpoint. */
const INTERAKT_ENDPOINT = "https://api.interakt.ai/v1/public/message/";

/** India default — leads/customers are stored as 10-digit national numbers. */
const COUNTRY_CODE = "91";

/**
 * Ordered placeholder values per template. Interakt fills `{{1}}`, `{{2}}`… from
 * a positional array, so each template's variable order is pinned here (it must
 * match the body of the approved template in the Interakt console).
 */
function bodyValuesFor(
  name: WhatsAppTemplate,
  vars: TemplateVars,
): string[] {
  switch (name) {
    case "order_confirmation":
      return [vars.order_number ?? "", vars.total ?? ""];
    case "order_shipped":
      return [
        vars.order_number ?? "",
        vars.courier ?? "",
        vars.tracking_url ?? "",
      ];
    case "lead_welcome":
    case "lead_followup":
      return [vars.code ?? ""];
  }
}

export const interaktProvider: WhatsAppProvider = {
  name: "interakt",

  async sendTemplate(
    name: WhatsAppTemplate,
    phone: string,
    vars: TemplateVars,
  ): Promise<WhatsAppSendResult> {
    try {
      const env = serverEnv();
      // Defensive: the facade only selects this provider when the key is set,
      // but guard anyway so a direct call can never send unauthenticated.
      if (!env.WHATSAPP_API_KEY) {
        console.info(
          `[whatsapp][interakt] send skipped (no key) — ${name} to ${phone}`,
        );
        return { sent: false, reason: "no-key" };
      }

      const res = await fetch(INTERAKT_ENDPOINT, {
        method: "POST",
        headers: {
          // Interakt authenticates with a Basic-scheme API key.
          authorization: `Basic ${env.WHATSAPP_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          countryCode: COUNTRY_CODE,
          phoneNumber: phone,
          type: "Template",
          template: {
            name,
            languageCode: "en",
            bodyValues: bodyValuesFor(name, vars),
          },
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error(
          `[whatsapp][interakt] provider error (${res.status}) — ${name} to ${phone}: ${detail}`,
        );
        return { sent: false, reason: "error" };
      }

      console.info(`[whatsapp][interakt] sent ${name} to ${phone}`);
      return { sent: true };
    } catch (err) {
      // Non-fatal: a send failure must never break the caller.
      console.error(
        `[whatsapp][interakt] send threw (non-fatal) — ${name} to ${phone}:`,
        err,
      );
      return { sent: false, reason: "error" };
    }
  },
};
