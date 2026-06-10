"use client";

import { useState } from "react";
import { PackSelector } from "@/components/store/PackSelector";
import { Button } from "@/components/ui/Button";
import { formatPaiseINR } from "@/lib/format";
import { packPillLabel, type PackTier } from "@/lib/products/types";

/**
 * The buy area of the product detail page, plus a sticky add-to-cart bar that
 * appears on mobile. Both share one piece of state — the selected pack index —
 * so switching the pack updates the in-page price, the ₹/day, AND the sticky
 * bar together.
 *
 * Reuses the existing `PackSelector` primitive (15/30/90, 30-day pre-selected
 * via `defaultIndex`). "Add to cart" is a layout-only PLACEHOLDER: cart wiring
 * arrives in feature 4, which will consume `{ productId, pack_key, qty }`.
 */
export function ProductBuyBox({
  productId,
  productName,
  tiers,
  defaultIndex,
  badges,
}: {
  productId: string;
  productName: string;
  tiers: PackTier[];
  defaultIndex: number;
  badges: string[];
}) {
  const [index, setIndex] = useState(defaultIndex);
  const tier = tiers[index] ?? tiers[0];

  if (!tier) return null;

  // The cart payload feature 4 will send (item refs only — never prices).
  const cartRef = { productId, pack_key: tier.key, qty: 1 };

  return (
    <div className="pdp-buy">
      <div className="pdp-pack-label mono">Choose your pack</div>
      <PackSelector
        packs={tiers.map(packPillLabel)}
        defaultIndex={defaultIndex}
        onChange={setIndex}
      />
      <div className="price-row pdp-price-row">
        <span className="price">{formatPaiseINR(tier.price_paise)}</span>
        <span className="perday">{formatPaiseINR(tier.per_day_paise)}/DAY</span>
        {tier.discount_pct > 0 ? (
          <span className="pdp-save mono">Save {tier.discount_pct}%</span>
        ) : null}
      </div>

      <Button
        variant="lime"
        className="add"
        // Placeholder — feature 4 reads this ref to add to cart.
        data-cart-ref={JSON.stringify(cartRef)}
      >
        Add to cart
      </Button>

      {badges.length > 0 ? (
        <ul className="pdp-badges" aria-label="Certifications">
          {badges.map((b) => (
            <li key={b} className="pdp-badge">
              <span aria-hidden>✓</span> {b}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Sticky add-to-cart — shown on mobile only (CSS), shares pack state. */}
      <div className="sticky-cta" aria-hidden={false}>
        <div className="sticky-cta-info">
          <span className="sticky-cta-name">{productName}</span>
          <span className="sticky-cta-price">
            {formatPaiseINR(tier.price_paise)}
            <small> · {tier.label}</small>
          </span>
        </div>
        <Button variant="lime" data-cart-ref={JSON.stringify(cartRef)}>
          Add to cart
        </Button>
      </div>
    </div>
  );
}
