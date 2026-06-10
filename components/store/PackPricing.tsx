"use client";

import { useState } from "react";
import { PackSelector } from "@/components/store/PackSelector";
import { Button } from "@/components/ui/Button";
import { formatPaiseINR } from "@/lib/format";
import { packPillLabel, type PackTier } from "@/lib/products/types";
import { useCart } from "@/lib/cart/store";

/**
 * Client island for a Shop product card: the pack-tier selector plus the live
 * price / ₹-per-day, which recompute from the selected tier. The surrounding
 * card (image, name, rating) stays a server component. "Add to cart" adds the
 * product at the selected tier (a ref only — `{ product_id, pack_key, qty }`)
 * and opens the cart drawer.
 */
export function PackPricing({
  productId,
  tiers,
  defaultIndex,
}: {
  productId: string;
  tiers: PackTier[];
  defaultIndex: number;
}) {
  const [index, setIndex] = useState(defaultIndex);
  const addProduct = useCart((s) => s.addProduct);
  const tier = tiers[index] ?? tiers[0];

  if (!tier) return null;

  return (
    <>
      <PackSelector
        packs={tiers.map(packPillLabel)}
        defaultIndex={defaultIndex}
        onChange={setIndex}
      />
      <div className="price-row">
        <span className="price">{formatPaiseINR(tier.price_paise)}</span>
        <span className="perday">{formatPaiseINR(tier.per_day_paise)}/DAY</span>
      </div>
      <Button
        variant="lime"
        className="add"
        onClick={() => addProduct(productId, tier.key)}
      >
        Add to cart
      </Button>
    </>
  );
}
