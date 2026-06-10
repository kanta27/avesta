"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPaiseINR } from "@/lib/format";
import { lineKey } from "@/lib/cart/types";
import { useCart } from "@/lib/cart/store";
import { useCatalog, type ResolvedLine } from "./CatalogProvider";

/**
 * The shared cart body — line items + summary — rendered both inside the
 * slide-over drawer and on the full `/cart` page. All money is JOINED from the
 * catalog at render (the store holds refs only), so quantity and pack changes
 * recompute the subtotal and ₹/day rollup automatically.
 *
 * `variant` only tweaks layout/labels; the logic is identical.
 */
export function CartContents({
  variant,
  onNavigate,
}: {
  variant: "drawer" | "page";
  /** Called when a link is followed (drawer uses it to close itself). */
  onNavigate?: () => void;
}) {
  const items = useCart((s) => s.items);
  const { resolve } = useCatalog();

  // Resolve every ref against the live catalog. Lines whose product/bundle is
  // no longer active resolve to null and are shown as a removable "unavailable"
  // row, excluded from all totals.
  const resolved = items.map((line) => ({
    line,
    key: lineKey(line),
    row: resolve(line),
  }));

  const priced = resolved.filter(
    (r): r is typeof r & { row: ResolvedLine } => r.row !== null,
  );

  const subtotalPaise = priced.reduce(
    (sum, r) => sum + r.row.unitPaise * r.row.qty,
    0,
  );
  // ₹/day rollup — single products only; bundles have no per-day value.
  const perDayPaise = priced.reduce(
    (sum, r) => sum + (r.row.perDayPaise ?? 0) * r.row.qty,
    0,
  );
  const hasBundle = priced.some((r) => r.row.perDayPaise === null);

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <p className="cart-empty-emoji" aria-hidden>
          🛒
        </p>
        <p className="cart-empty-title">Your cart is empty</p>
        <p className="cart-empty-sub">
          Add a product or a pack to get started.
        </p>
        <Button variant="lime" href="/shop" onClick={onNavigate}>
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className={`cart-body cart-body-${variant}`}>
      <ul className="cart-lines">
        {resolved.map(({ key, line, row }) =>
          row ? (
            <CartLineRow key={key} row={row} onNavigate={onNavigate} />
          ) : (
            <UnavailableRow key={key} cartKey={key} kind={line.kind} />
          ),
        )}
      </ul>

      <div className="cart-summary">
        <DiscountField />

        <div className="cart-rollup">
          <div className="cart-rollup-row">
            <span>Subtotal</span>
            <span className="cart-subtotal">
              {formatPaiseINR(subtotalPaise)}
            </span>
          </div>
          {perDayPaise > 0 ? (
            <div className="cart-rollup-row cart-rollup-perday">
              <span>
                Cost per day
                {hasBundle ? (
                  <small className="cart-perday-note"> · single products</small>
                ) : null}
              </span>
              <span className="mono">{formatPaiseINR(perDayPaise)}/day</span>
            </div>
          ) : null}
          <p className="cart-tax-note mono">
            Taxes &amp; shipping calculated at checkout.
          </p>
        </div>

        {/* PLACEHOLDER — real checkout (pricing re-computed server-side from the
            DB) lands in feature 5. */}
        <Button
          variant="lime"
          className="cart-checkout"
          aria-disabled
          title="Checkout arrives in a later step"
          href="/cart"
          onClick={(e) => e.preventDefault()}
        >
          Proceed to checkout →
        </Button>
        {variant === "drawer" ? (
          <Link className="cart-view-link" href="/cart" onClick={onNavigate}>
            View full cart
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function CartLineRow({
  row,
  onNavigate,
}: {
  row: ResolvedLine;
  onNavigate?: () => void;
}) {
  const setQty = useCart((s) => s.setQty);
  const updatePack = useCart((s) => s.updatePack);
  const removeLine = useCart((s) => s.removeLine);

  return (
    <li className="cart-line">
      <span
        className="cart-line-thumb"
        style={row.image ? undefined : { background: row.placeholder.background }}
      >
        {row.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.image.url} alt={row.image.alt ?? row.name} />
        ) : (
          <span aria-hidden>{row.placeholder.emoji}</span>
        )}
      </span>

      <div className="cart-line-main">
        <div className="cart-line-top">
          {row.href ? (
            <Link
              href={row.href}
              className="cart-line-name"
              onClick={onNavigate}
            >
              {row.name}
            </Link>
          ) : (
            <span className="cart-line-name">{row.name}</span>
          )}
          <button
            type="button"
            className="cart-line-remove"
            onClick={() => removeLine(row.key)}
            aria-label={`Remove ${row.name} from cart`}
          >
            ✕
          </button>
        </div>

        {/* Pack selector (product lines) — switching re-tiers the line. */}
        {row.packOptions && row.packKey ? (
          <label className="cart-line-pack">
            <span className="sr-only">Pack size for {row.name}</span>
            <select
              value={row.packKey}
              onChange={(e) => updatePack(row.key, e.target.value)}
            >
              {row.packOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="cart-line-bottom">
          <div
            className="cart-qty"
            role="group"
            aria-label={`Quantity for ${row.name}`}
          >
            <button
              type="button"
              onClick={() => setQty(row.key, row.qty - 1)}
              disabled={row.qty <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="cart-qty-val" aria-live="polite">
              {row.qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(row.key, row.qty + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="cart-line-price">
            {formatPaiseINR(row.unitPaise * row.qty)}
          </span>
        </div>
      </div>
    </li>
  );
}

/** A line whose product/bundle is no longer in the active catalog. */
function UnavailableRow({
  cartKey,
  kind,
}: {
  cartKey: string;
  kind: "product" | "bundle";
}) {
  const removeLine = useCart((s) => s.removeLine);
  return (
    <li className="cart-line cart-line-unavailable">
      <span className="cart-line-thumb" aria-hidden>
        ⚠️
      </span>
      <div className="cart-line-main">
        <div className="cart-line-top">
          <span className="cart-line-name">
            This {kind} is no longer available
          </span>
          <button
            type="button"
            className="cart-line-remove"
            onClick={() => removeLine(cartKey)}
            aria-label="Remove unavailable item from cart"
          >
            ✕
          </button>
        </div>
        <p className="cart-line-unavailable-note">Remove it to continue.</p>
      </div>
    </li>
  );
}

/** Discount-code field — UI ONLY. Validation happens server-side at checkout
 *  (feature 8); applying here would mean trusting a client value. */
function DiscountField() {
  const [code, setCode] = useState("");
  return (
    <form
      className="cart-discount"
      onSubmit={(e) => e.preventDefault()}
      aria-label="Discount code"
    >
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Discount code"
        aria-label="Discount code"
        autoComplete="off"
        spellCheck={false}
      />
      <button type="submit" className="cart-discount-apply" disabled={!code}>
        Apply
      </button>
    </form>
  );
}
