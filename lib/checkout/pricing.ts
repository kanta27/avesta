import "server-only";

import { getActiveProducts } from "@/lib/products/queries";
import { getActiveBundles } from "@/lib/bundles/queries";
import type { CheckoutLine } from "./validation";

/**
 * Server-side re-pricer — the single source of truth for money at checkout.
 *
 * GUARDRAIL (conventions.md): never trust client-sent prices. The client sends
 * item refs only; here we re-fetch products/bundles from the DB and recompute
 * every line, subtotal, and total from the live catalog. A forged price in the
 * request cannot influence the outcome — we read only product_id/pack_key/qty.
 *
 * Reads go through the RLS-bound query layer, which returns only `is_active`
 * rows, so a deactivated or deleted product/bundle simply won't resolve and the
 * line is rejected (rather than silently priced from stale client data).
 *
 * Money is integer paise throughout (conventions.md) — no floats.
 */

/** One re-priced cart line, shaped for the `orders.items` jsonb column. */
export interface PricedItem {
  kind: "product" | "bundle";
  /** Present on product lines. */
  product_id?: string;
  /** Present on bundle lines. */
  bundle_id?: string;
  name: string;
  /** Present on product lines (the chosen pack tier). */
  pack_key?: string;
  qty: number;
  /** Server-computed unit price (paise) for the chosen pack / bundle. */
  unit_price_paise: number;
  /** `unit_price_paise * qty`, precomputed for the order record. */
  line_total_paise: number;
}

/** The fully re-priced cart, all money server-computed in integer paise. */
export interface PricedCart {
  items: PricedItem[];
  subtotalPaise: number;
  /** Pre-discount: always 0 here. The create-order route applies any valid
   *  discount code (feature 8, lib/discounts.ts) on top of this cart. */
  discountPaise: number;
  /** Always 0 — free shipping for now (approved), structured to change. */
  shippingPaise: number;
  /** Pre-discount total (== subtotal here). The route recomputes the final total
   *  after applying the discount code. */
  totalPaise: number;
}

export type PriceResult =
  | { ok: true; cart: PricedCart }
  | { ok: false; error: string };

/**
 * Shipping charge for an order. Free for now (approved). Kept as a function so a
 * future rule (flat fee, free-over-threshold, zone-based) is a one-place change
 * without touching the create-order flow — such a rule would take `subtotalPaise`.
 */
function computeShippingPaise(): number {
  return 0;
}

/**
 * Re-price a validated set of cart lines from the DB. Returns a priced cart, or
 * an `ok:false` result naming the first line that could no longer be priced
 * (deactivated/deleted product, bundle, or pack tier) so the route can surface a
 * clean 4xx instead of charging a wrong amount.
 */
export async function priceCart(lines: CheckoutLine[]): Promise<PriceResult> {
  const [products, bundles] = await Promise.all([
    getActiveProducts(),
    getActiveBundles(),
  ]);
  const productById = new Map(products.map((p) => [p.id, p]));
  const bundleById = new Map(bundles.map((b) => [b.id, b]));

  const items: PricedItem[] = [];

  for (const line of lines) {
    if (line.kind === "product") {
      const product = productById.get(line.product_id);
      if (!product) {
        return { ok: false, error: "A product in your cart is no longer available." };
      }
      const tier = product.packTiers.find((t) => t.key === line.pack_key);
      if (!tier) {
        return { ok: false, error: "A pack option in your cart is no longer available." };
      }
      const unit = tier.price_paise;
      items.push({
        kind: "product",
        product_id: product.id,
        name: product.name,
        pack_key: tier.key,
        qty: line.qty,
        unit_price_paise: unit,
        line_total_paise: unit * line.qty,
      });
    } else {
      const bundle = bundleById.get(line.bundle_id);
      if (!bundle) {
        return { ok: false, error: "A bundle in your cart is no longer available." };
      }
      const unit = bundle.pricePaise;
      items.push({
        kind: "bundle",
        bundle_id: bundle.id,
        name: bundle.name,
        qty: line.qty,
        unit_price_paise: unit,
        line_total_paise: unit * line.qty,
      });
    }
  }

  const subtotalPaise = items.reduce((sum, i) => sum + i.line_total_paise, 0);

  // The re-pricer is catalog-only: it produces the pre-discount cart. Discount
  // codes are validated and applied by the create-order route via
  // lib/discounts.ts (feature 8), which recomputes the final total from this
  // subtotal. So discountPaise stays 0 in the priced cart itself.
  const discountPaise = 0;

  const shippingPaise = computeShippingPaise();
  const totalPaise = subtotalPaise - discountPaise + shippingPaise;

  return {
    ok: true,
    cart: { items, subtotalPaise, discountPaise, shippingPaise, totalPaise },
  };
}
