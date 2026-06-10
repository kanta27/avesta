import type { PricedItem } from "@/lib/checkout/pricing";

/**
 * The slice of an `orders` row needed to render a confirmation page and build a
 * receipt. Selected at the created→paid transition (see the confirm route and
 * the Razorpay webhook) and read again server-side by the confirmation page.
 *
 * `items` is the re-priced cart stored in the `orders.items` jsonb column — the
 * same `PricedItem[]` shape produced by the server-side re-pricer.
 */
export interface ConfirmationOrder {
  /** Non-guessable UUID PK — the key the confirmation page is fetched by. */
  id: string;
  /** Human order number (AV-YYYY-NNNNNN) — sequential, shown but never a key. */
  order_number: string;
  name: string | null;
  email: string | null;
  items: PricedItem[];
  total_paise: number;
  /** ISO timestamp; used to compute the delivery estimate. */
  created_at: string | null;
}
