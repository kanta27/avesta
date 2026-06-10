"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { PRODUCT_PLACEHOLDER } from "@/lib/products/placeholder";
import type { ProductListItem } from "@/lib/products/types";
import type { BundleListItem } from "@/lib/bundles/types";
import type { CartLine } from "@/lib/cart/types";

/**
 * Display data for one resolved cart line — the prices shown in the drawer /
 * cart page, JOINED from the server-provided catalog at render time. This never
 * persists: the cart stores refs only, so money here always reflects the live
 * catalog (and would update the instant a price changes server-side).
 */
export interface ResolvedLine {
  key: string;
  qty: number;
  name: string;
  href: string | null;
  /** Image url, or null → caller falls back to the emoji/gradient placeholder. */
  image: { url: string; alt?: string } | null;
  /** Emoji + gradient placeholder for when there is no image. */
  placeholder: { emoji: string; background: string };
  /** Unit price in paise for the chosen pack / bundle. */
  unitPaise: number;
  /** Per-day price in paise (products only; null for bundles). */
  perDayPaise: number | null;
  /** Sub-label, e.g. the pack tier label ("30-day"); null for bundles. */
  packLabel: string | null;
  /** For product lines: the pack options to switch between. */
  packOptions: { key: string; label: string }[] | null;
  /** The product's current pack_key (product lines only). */
  packKey: string | null;
}

interface CatalogValue {
  /** Resolve a ref line to its priced display row, or null if the underlying
   *  product/bundle is no longer in the active catalog (deleted/deactivated). */
  resolve: (line: CartLine) => ResolvedLine | null;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({
  products,
  bundles,
  children,
}: {
  products: ProductListItem[];
  bundles: BundleListItem[];
  children: ReactNode;
}) {
  const value = useMemo<CatalogValue>(() => {
    const productById = new Map(products.map((p) => [p.id, p]));
    const bundleById = new Map(bundles.map((b) => [b.id, b]));

    const resolve = (line: CartLine): ResolvedLine | null => {
      if (line.kind === "product") {
        const p = productById.get(line.product_id);
        if (!p) return null;
        const tier = p.packTiers.find((t) => t.key === line.pack_key);
        if (!tier) return null;
        return {
          key: `p:${line.product_id}:${line.pack_key}`,
          qty: line.qty,
          name: p.name,
          href: `/shop/${p.slug}`,
          image: p.images[0] ?? null,
          placeholder: PRODUCT_PLACEHOLDER[p.type],
          unitPaise: tier.price_paise,
          perDayPaise: tier.per_day_paise,
          packLabel: tier.label,
          packOptions: p.packTiers.map((t) => ({ key: t.key, label: t.label })),
          packKey: line.pack_key,
        };
      }
      const b = bundleById.get(line.bundle_id);
      if (!b) return null;
      // A bundle's "type" for the placeholder: use its first member, else gummy.
      const placeholderType = b.members[0]?.type ?? "gummy";
      return {
        key: `b:${line.bundle_id}`,
        qty: line.qty,
        name: b.name,
        href: `/bundles`,
        image: b.image,
        placeholder: PRODUCT_PLACEHOLDER[placeholderType],
        unitPaise: b.pricePaise,
        perDayPaise: null,
        packLabel: null,
        packOptions: null,
        packKey: null,
      };
    };

    return { resolve };
  }, [products, bundles]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return ctx;
}
