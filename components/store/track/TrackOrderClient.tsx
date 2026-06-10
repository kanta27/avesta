"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { formatPaiseINR } from "@/lib/format";
import { useCart } from "@/lib/cart/store";
import type { CartLine } from "@/lib/cart/types";
import { useCatalog } from "@/components/store/cart/CatalogProvider";
import type {
  OrderStatus,
  TrackHistoryEntry,
  TrackItem,
  TrackOrder,
  TrackResponse,
} from "@/lib/track/types";
import { StatusTimeline } from "./StatusTimeline";

/** Off-path terminal states shown as a banner instead of the progress timeline. */
const TERMINAL_BANNER: Partial<Record<OrderStatus, string>> = {
  cancelled: "This order was cancelled.",
  refunded: "This order was refunded.",
};

/** Friendly status label for badges / history rows. */
const STATUS_LABEL: Record<OrderStatus, string> = {
  created: "Pending payment",
  paid: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

type ViewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; order: TrackOrder; history: TrackHistoryEntry[] }
  | { kind: "notfound" }
  | { kind: "ratelimited" }
  | { kind: "error" };

/**
 * The /track interaction (feature 7). Posts (order number + phone) to the
 * rate-limited `/api/track`, then renders the matched order's status timeline,
 * tracking state, and the phone's order history — or a single uniform
 * "not found" message for any miss (the API never reveals whether a number is
 * real). Reorder is wired in a later step.
 */
export function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [view, setView] = useState<ViewState>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setView({ kind: "loading" });
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });

      if (res.status === 429) {
        setView({ kind: "ratelimited" });
        return;
      }
      if (!res.ok) {
        setView({ kind: "error" });
        return;
      }

      const data = (await res.json()) as TrackResponse;
      if (data.found) {
        setView({ kind: "found", order: data.order, history: data.history });
      } else {
        setView({ kind: "notfound" });
      }
    } catch {
      setView({ kind: "error" });
    }
  }

  const isLoading = view.kind === "loading";

  return (
    <div className="track-panel">
      <form className="track-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="Order number (e.g. AV-2026-000123)"
            aria-label="Order number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="Phone number"
            aria-label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <Button variant="lime" type="submit" className="track-submit">
          {isLoading ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {view.kind === "notfound" && (
        <p className="track-message track-message-warn" role="status">
          We couldn&apos;t find an order matching that number and phone. Please
          double-check both and try again.
        </p>
      )}
      {view.kind === "ratelimited" && (
        <p className="track-message track-message-warn" role="status">
          Too many attempts. Please wait a minute and try again.
        </p>
      )}
      {view.kind === "error" && (
        <p className="track-message track-message-warn" role="status">
          Something went wrong looking up your order. Please try again.
        </p>
      )}

      {view.kind === "found" && (
        <FoundOrder order={view.order} history={view.history} />
      )}
    </div>
  );
}

function FoundOrder({
  order,
  history,
}: {
  order: TrackOrder;
  history: TrackHistoryEntry[];
}) {
  const banner = TERMINAL_BANNER[order.status];
  const addMany = useCart((s) => s.addMany);
  const openCart = useCart((s) => s.open);
  const { resolve } = useCatalog();
  const [reorderNote, setReorderNote] = useState<string | null>(null);

  /**
   * Reorder: map the past order's items to REFS-ONLY cart lines (no prices —
   * the cart re-prices at checkout), keeping only those whose product/bundle +
   * pack still resolve in the live catalog. Skipped (now inactive/removed) lines
   * are reported, never crashed on. Adding opens the drawer.
   */
  function onReorder() {
    const lines: CartLine[] = [];
    let skipped = 0;
    for (const item of order.items) {
      const line = toCartLine(item);
      if (line && resolve(line)) lines.push(line);
      else skipped += 1;
    }

    if (lines.length > 0) {
      addMany(lines);
      setReorderNote(
        skipped > 0
          ? `Added ${lines.length} item${lines.length === 1 ? "" : "s"} to your cart. ${skipped} item${skipped === 1 ? " is" : "s are"} no longer available and ${skipped === 1 ? "was" : "were"} left out.`
          : null,
      );
    } else {
      openCart();
      setReorderNote(
        "None of this order's items are available to buy right now.",
      );
    }
  }

  return (
    <div className="track-result">
      <div className="track-order-card">
        <div className="track-order-head">
          <div>
            <p className="track-order-label">Order number</p>
            <p className="track-order-number mono">{order.orderNumber}</p>
          </div>
          <span className={`track-badge track-badge-${order.status}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <p className="track-order-placed">Placed {formatDate(order.createdAt)}</p>

        {banner ? (
          <p className="track-banner" role="status">
            {banner}
          </p>
        ) : (
          <StatusTimeline status={order.status} />
        )}

        <TrackingBlock order={order} />

        <ul className="track-lines">
          {order.items.map((item, i) => (
            <li
              className="track-line"
              key={`${item.kind}-${item.product_id ?? item.bundle_id ?? i}-${item.pack_key ?? ""}`}
            >
              <span className="track-line-name">
                {item.name}
                {item.pack_key ? (
                  <span className="track-line-pack mono">{item.pack_key}</span>
                ) : null}
                <span className="track-line-qty mono">Qty {item.qty}</span>
              </span>
              <span className="track-line-price">
                {formatPaiseINR(item.line_total_paise)}
              </span>
            </li>
          ))}
        </ul>
        <div className="track-total">
          <span>Order total</span>
          <span>{formatPaiseINR(order.total_paise)}</span>
        </div>

        <div className="track-actions">
          <Button variant="lime" onClick={onReorder} className="track-reorder">
            Reorder these items
          </Button>
        </div>
        {reorderNote && (
          <p className="track-message track-message-warn" role="status">
            {reorderNote}
          </p>
        )}
      </div>

      {history.length > 1 && (
        <div className="track-history">
          <h2 className="track-history-title">Your recent orders</h2>
          <ul className="track-history-list">
            {history.map((h) => (
              <li
                key={h.orderNumber}
                className={`track-history-row${
                  h.orderNumber === order.orderNumber
                    ? " track-history-row-current"
                    : ""
                }`}
              >
                <span className="track-history-num mono">{h.orderNumber}</span>
                <span className="track-history-date">
                  {formatDate(h.createdAt)}
                </span>
                <span className="track-history-count mono">
                  {h.itemCount} item{h.itemCount === 1 ? "" : "s"}
                </span>
                <span className={`track-badge track-badge-${h.status}`}>
                  {STATUS_LABEL[h.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Tracking link block. `tracking_url`/`courier` are null until admin sets them
 * (feature 12), so show a graceful "not yet shipped" state until then.
 */
function TrackingBlock({ order }: { order: TrackOrder }) {
  if (order.tracking) {
    return (
      <div className="track-shipment">
        <p className="track-shipment-label">
          On its way{order.tracking.courier ? ` via ${order.tracking.courier}` : ""}
        </p>
        <a
          className="track-shipment-link"
          href={order.tracking.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Track shipment ↗
        </a>
      </div>
    );
  }
  return (
    <p className="track-shipment track-shipment-pending">
      Not yet shipped — a tracking link will appear here once your order is on
      its way.
    </p>
  );
}

/**
 * Map a tracked order item to a REFS-ONLY cart line — never carries price.
 * Returns null for a malformed item (missing the id/pack a cart ref needs); the
 * caller treats that the same as an unavailable item and skips it.
 */
function toCartLine(item: TrackItem): CartLine | null {
  if (item.kind === "product") {
    if (!item.product_id || !item.pack_key) return null;
    return {
      kind: "product",
      product_id: item.product_id,
      pack_key: item.pack_key,
      qty: item.qty,
    };
  }
  if (!item.bundle_id) return null;
  return { kind: "bundle", bundle_id: item.bundle_id, qty: item.qty };
}

/** Display-only date formatter (e.g. "9 Jun 2026"). */
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
