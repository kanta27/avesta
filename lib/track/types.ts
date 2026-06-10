// Shared track-lookup response types — client-safe (no server imports, no secrets).
//
// The shapes the `/api/track` route returns and the `/track` UI consumes. Item
// entries keep their refs (product_id / bundle_id / pack_key) so the client can
// map a past order back to REFS-ONLY cart lines for reorder, plus display-only
// name / qty / line total for the verified owner's own receipt.

/** Every order status in the schema's check constraint. */
export type OrderStatus =
  | "created"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/** The ordered, happy-path milestones shown in the status timeline. */
export const STATUS_TIMELINE = [
  "created",
  "paid",
  "packed",
  "shipped",
  "delivered",
] as const satisfies readonly OrderStatus[];

/** The subset of statuses that appear as timeline steps. */
export type TimelineStatus = (typeof STATUS_TIMELINE)[number];

/** One line of a tracked order — refs for reorder + display fields. No secrets. */
export interface TrackItem {
  kind: "product" | "bundle";
  product_id?: string;
  bundle_id?: string;
  name: string;
  pack_key?: string;
  qty: number;
  line_total_paise: number;
}

/** The fully resolved order returned on a successful (number + phone) match. */
export interface TrackOrder {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string | null;
  total_paise: number;
  items: TrackItem[];
  /** Present once admin sets it (feature 12); null until the order ships. */
  tracking: { url: string; courier: string | null } | null;
}

/** A compact row in the matched phone's order history. */
export interface TrackHistoryEntry {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string | null;
  /** Total units across the order's lines. */
  itemCount: number;
}

/**
 * The track-lookup result. A miss is the UNIFORM negative: a real order number
 * with the wrong phone returns the exact same `{ found: false }` as a number
 * that doesn't exist — no field, status, or message distinguishes them.
 */
export type TrackResponse =
  | { found: true; order: TrackOrder; history: TrackHistoryEntry[] }
  | { found: false };
