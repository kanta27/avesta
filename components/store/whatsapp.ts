/**
 * WhatsApp business number for wa.me links (FAB + drawer order button).
 * Placeholder until the WhatsApp Business account is provisioned (Part F /
 * feature 10) — swap once, both surfaces update.
 */
export const WA_NUMBER = "910000000000";

export function waLink(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
