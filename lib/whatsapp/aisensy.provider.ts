import "server-only";
import { serverEnv } from "@/lib/env.server";
import type {
  TemplateVars,
  WhatsAppProvider,
  WhatsAppSendResult,
  WhatsAppTemplate,
} from "./types";

/**
 * AiSensy implementation of `WhatsAppProvider`. Server-only.
 *
 * The second of the two modules allowed to reference a WhatsApp provider
 * endpoint (the other is `interakt.provider.ts`). Selecting AiSensy over Interakt
 * is a one-env swap (`WHATSAPP_PROVIDER=aisensy`) — no call site changes, because
 * the rest of the app only ever talks to the facade in `./index`.
 *
 * DORMANT until `WHATSAPP_API_KEY` is set, NON-FATAL, NEVER throws — identical
 * contract to the Interakt provider. The real send path is wired but inert until
 * the key + approved AiSensy campaigns exist.
 *
 * AiSensy's campaign API takes the API key in the body, the recipient with the
 * country code prefixed, and template placeholders as an ordered
 * `templateParams` array. `campaignName` must match an approved AiSensy campaign;
 * we map each template 1:1 to a campaign of the same name.
 */

/** AiSensy's campaign send endpoint. */
const AISENSY_ENDPOINT = "https://backend.aisensy.com/campaign/t1/api/v2";

/** India default — leads/customers are stored as 10-digit national numbers. */
const COUNTRY_CODE = "91";

/**
 * Ordered placeholder values per template (AiSensy fills its template params
 * positionally). Order must match the approved campaign body in AiSensy.
 */
function templateParamsFor(
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
    case "review_request":
      return [vars.order_number ?? "", vars.review_url ?? ""];
    case "lead_welcome":
    case "lead_followup":
      return [vars.code ?? ""];
  }
}

export const aisensyProvider: WhatsAppProvider = {
  name: "aisensy",

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
          `[whatsapp][aisensy] send skipped (no key) — ${name} to ${phone}`,
        );
        return { sent: false, reason: "no-key" };
      }

      const res = await fetch(AISENSY_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          // AiSensy authenticates with the API key in the request body.
          apiKey: env.WHATSAPP_API_KEY,
          campaignName: name,
          destination: `${COUNTRY_CODE}${phone}`,
          // AiSensy requires a non-empty user name field.
          userName: "Avesta Nordic",
          templateParams: templateParamsFor(name, vars),
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error(
          `[whatsapp][aisensy] provider error (${res.status}) — ${name} to ${phone}: ${detail}`,
        );
        return { sent: false, reason: "error" };
      }

      console.info(`[whatsapp][aisensy] sent ${name} to ${phone}`);
      return { sent: true };
    } catch (err) {
      // Non-fatal: a send failure must never break the caller.
      console.error(
        `[whatsapp][aisensy] send threw (non-fatal) — ${name} to ${phone}:`,
        err,
      );
      return { sent: false, reason: "error" };
    }
  },
};
