"use client";

import { useCartHydrated } from "@/lib/cart/store";
import { CartContents } from "./CartContents";

/**
 * Client body for `/cart`. Gated on hydration because the cart lives in
 * localStorage — the server can't know its contents, so we render a neutral
 * placeholder until mounted, then the real (catalog-priced) lines.
 */
export function CartPageBody() {
  const hydrated = useCartHydrated();

  if (!hydrated) {
    return <p className="cart-page-loading mono">Loading your cart…</p>;
  }
  return <CartContents variant="page" />;
}
