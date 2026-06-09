"use client";

import { useState } from "react";
import { PackSelector } from "@/components/store/PackSelector";
import { Button } from "@/components/ui/Button";
import { formatPaiseINR } from "@/lib/format";
import { packPillLabel, type PackTier } from "@/lib/products/types";

/**
 * Client island for a Shop product card: the pack-tier selector plus the live
 * price / ₹-per-day, which recompute from the selected tier. The surrounding
 * card (image, name, rating) stays a server component.
 */
export function PackPricing({
  tiers,
  defaultIndex,
}: {
  tiers: PackTier[];
  defaultIndex: number;
}) {
  const [index, setIndex] = useState(defaultIndex);
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
      {/* Cart wiring arrives in feature 4; placeholder for now. */}
      <Button variant="lime" className="add">
        Add to cart
      </Button>
    </>
  );
}
