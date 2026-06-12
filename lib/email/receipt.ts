import "server-only";

import { serverEnv } from "@/lib/env.server";
import { formatPaiseINR } from "@/lib/format";
import type { ConfirmationOrder } from "@/lib/receipts/types";

/**
 * Transactional receipt email — built but DORMANT until `EMAIL_API_KEY` is set.
 *
 * Contract (conventions.md — sends are non-fatal):
 *   - No key  → log "receipt send skipped (no key)" and return; the order is
 *     unaffected. This is the current state until a provider key is added.
 *   - Key set → the REAL send path runs untouched (Resend transactional email).
 *     Adding the env var alone makes receipts go live — no code change.
 *   - This function NEVER throws. Any failure (network, provider 4xx/5xx, bug)
 *     is caught and logged; a failed receipt must never fail the order.
 */
export type ReceiptEmailResult =
  | { sent: false; reason: "no-key" | "no-recipient" | "error" }
  | { sent: true };

export async function sendOrderReceiptEmail(
  order: ConfirmationOrder,
): Promise<ReceiptEmailResult> {
  try {
    const env = serverEnv();

    if (!env.EMAIL_API_KEY) {
      console.info(
        `[receipt] receipt send skipped (no key) — order ${order.order_number}`,
      );
      return { sent: false, reason: "no-key" };
    }

    if (!order.email) {
      // Email is optional at checkout; nothing to send to.
      console.info(
        `[receipt] receipt send skipped (no email on order) — order ${order.order_number}`,
      );
      return { sent: false, reason: "no-recipient" };
    }

    // --- REAL SEND (dormant until EMAIL_API_KEY is present) -------------------
    // Provider: Resend transactional email. This path is intentionally untouched
    // and goes live the moment EMAIL_API_KEY is set — no further code change.
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.EMAIL_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: "Avesta Nordic <orders@avestahealth.in>",
        to: order.email,
        subject: `Your Avesta Nordic order ${order.order_number}`,
        html: renderReceiptHtml(order),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[receipt] email provider error (${res.status}) — order ${order.order_number}: ${detail}`,
      );
      return { sent: false, reason: "error" };
    }

    console.info(`[receipt] receipt email sent — order ${order.order_number}`);
    return { sent: true };
  } catch (err) {
    // Non-fatal: a receipt failure must never fail the order.
    console.error(
      `[receipt] email send threw (non-fatal) — order ${order.order_number}:`,
      err,
    );
    return { sent: false, reason: "error" };
  }
}

/** Minimal, dependency-free HTML receipt body. Money formatted at the edge. */
function renderReceiptHtml(order: ConfirmationOrder): string {
  const lines = order.items
    .map((item) => {
      const qty = `× ${item.qty}`;
      const price = formatPaiseINR(item.line_total_paise);
      return `<tr><td style="padding:6px 0">${escapeHtml(item.name)} ${qty}</td><td style="padding:6px 0;text-align:right">${price}</td></tr>`;
    })
    .join("");

  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0A3D3F">
  <h2>Thank you for your order</h2>
  <p>Your order <strong>${escapeHtml(order.order_number)}</strong> is confirmed and being prepared.</p>
  <table style="width:100%;max-width:480px;border-collapse:collapse">
    ${lines}
    <tr><td style="padding:10px 0;border-top:1px solid #DDE5DF"><strong>Total</strong></td>
    <td style="padding:10px 0;border-top:1px solid #DDE5DF;text-align:right"><strong>${formatPaiseINR(order.total_paise)}</strong></td></tr>
  </table>
  <p style="color:#5C6B68;font-size:13px">You'll get WhatsApp updates as your order ships. These products are not intended to diagnose, treat, cure or prevent any disease.</p>
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
