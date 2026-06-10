// Pure, client-safe cart types & helpers — NO server-only imports, no prices.
//
// SECURITY: a cart line carries item REFERENCES ONLY ({ product_id / bundle_id,
// pack_key, qty }). It never stores price, total, or per-day fields. Money's
// source of truth is the server, which re-prices every line from the DB at
// checkout (feature 5). Display prices are joined from the server-provided
// catalog at render time (see CatalogProvider) — never persisted here.

/** A product line: a product at one chosen pack tier, with a quantity. */
export interface ProductLine {
  kind: "product";
  product_id: string;
  pack_key: string;
  qty: number;
}

/** A bundle line: a fixed bundle, with a quantity. No pack tier. */
export interface BundleLine {
  kind: "bundle";
  bundle_id: string;
  qty: number;
}

/** One persisted cart line — refs only. The `kind` tag discriminates; it is
 *  not a price. */
export type CartLine = ProductLine | BundleLine;

/**
 * Stable identity for a line: used to dedupe on add and to target
 * update-qty / update-pack / remove. A product is keyed by product + pack so
 * the same product in two pack tiers is two distinct lines; a bundle is keyed
 * by its id alone.
 */
export function lineKey(line: CartLine): string {
  return line.kind === "product"
    ? `p:${line.product_id}:${line.pack_key}`
    : `b:${line.bundle_id}`;
}
