"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { lineKey, type CartLine } from "./types";

/**
 * Client-side, guest-first cart. Holds minimal item REFS only (see
 * `lib/cart/types.ts`) and persists them to `localStorage["av_cart"]`. There is
 * no server-side cart record in feature 4 — the `carts` table is for Phase 2
 * abandoned-cart recovery. Money is never stored here; it is re-priced from the
 * DB at checkout and joined from the catalog for display.
 */
interface CartState {
  /** Persisted: the cart lines (refs only). */
  items: CartLine[];
  /** Transient UI state — NOT persisted (see `partialize` below). */
  isOpen: boolean;

  addProduct: (product_id: string, pack_key: string) => void;
  addBundle: (bundle_id: string) => void;
  /** Bulk-add refs (e.g. reorder), merging dup keys by summing qty. Opens once. */
  addMany: (lines: CartLine[]) => void;
  setQty: (key: string, qty: number) => void;
  updatePack: (key: string, newPackKey: string) => void;
  removeLine: (key: string) => void;
  clear: () => void;

  open: () => void;
  close: () => void;
}

const STORAGE_KEY = "av_cart";

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addProduct: (product_id, pack_key) =>
        set((s) => {
          const key = `p:${product_id}:${pack_key}`;
          const existing = s.items.find((l) => lineKey(l) === key);
          const items = existing
            ? s.items.map((l) =>
                lineKey(l) === key ? { ...l, qty: l.qty + 1 } : l,
              )
            : [
                ...s.items,
                { kind: "product", product_id, pack_key, qty: 1 } as CartLine,
              ];
          return { items, isOpen: true };
        }),

      addBundle: (bundle_id) =>
        set((s) => {
          const key = `b:${bundle_id}`;
          const existing = s.items.find((l) => lineKey(l) === key);
          const items = existing
            ? s.items.map((l) =>
                lineKey(l) === key ? { ...l, qty: l.qty + 1 } : l,
              )
            : [...s.items, { kind: "bundle", bundle_id, qty: 1 } as CartLine];
          return { items, isOpen: true };
        }),

      // Merge a batch of ref lines into the cart in one update. Existing lines
      // gain the incoming qty; new keys are appended. Refs only — callers strip
      // any price/display fields before this point (see reorder in /track).
      addMany: (lines) =>
        set((s) => {
          if (lines.length === 0) return s;
          const items = s.items.map((l) => ({ ...l }));
          const indexByKey = new Map(items.map((l, i) => [lineKey(l), i]));
          for (const incoming of lines) {
            const key = lineKey(incoming);
            const existing = indexByKey.get(key);
            if (existing !== undefined) {
              items[existing].qty += incoming.qty;
            } else {
              indexByKey.set(key, items.length);
              items.push({ ...incoming });
            }
          }
          return { items, isOpen: true };
        }),

      setQty: (key, qty) =>
        set((s) => ({
          items: s.items.map((l) =>
            lineKey(l) === key ? { ...l, qty: Math.max(1, Math.round(qty)) } : l,
          ),
        })),

      // Re-tier a product line. If the target pack already exists as its own
      // line, merge the two (sum qtys, drop the old line) so we never end up
      // with two lines sharing an identity.
      updatePack: (key, newPackKey) =>
        set((s) => {
          const line = s.items.find((l) => lineKey(l) === key);
          if (!line || line.kind !== "product") return s;
          if (line.pack_key === newPackKey) return s;

          const targetKey = `p:${line.product_id}:${newPackKey}`;
          const target = s.items.find((l) => lineKey(l) === targetKey);

          if (target) {
            return {
              items: s.items
                .filter((l) => lineKey(l) !== key)
                .map((l) =>
                  lineKey(l) === targetKey
                    ? { ...l, qty: l.qty + line.qty }
                    : l,
                ),
            };
          }
          return {
            items: s.items.map((l) =>
              lineKey(l) === key ? { ...l, pack_key: newPackKey } : l,
            ),
          };
        }),

      removeLine: (key) =>
        set((s) => ({ items: s.items.filter((l) => lineKey(l) !== key) })),

      clear: () => set({ items: [] }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // Persist refs only — never the open/close UI flag.
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

/** Total number of units across all lines — drives the nav badge. */
export const selectCount = (s: CartState): number =>
  s.items.reduce((n, l) => n + l.qty, 0);

/**
 * True only once the persisted cart has rehydrated from localStorage. The cart
 * lives client-side, so the server (and the first hydration render) must show
 * the empty/neutral state to avoid a mismatch; gate any cart-dependent UI on
 * this and reveal real values afterwards.
 *
 * Implemented with `useSyncExternalStore` over zustand-persist's hydration
 * lifecycle: the server snapshot is always `false`, and the client flips to
 * `true` after `onFinishHydration` fires. This is the SSR-safe equivalent of a
 * mounted flag, without a setState-in-effect.
 */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useCart.persist.onFinishHydration(onChange),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}
