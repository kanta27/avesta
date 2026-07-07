"use client";

import { CartIcon } from "@/components/home/icons";
import { useCart, useCartHydrated, selectCount } from "@/lib/cart/store";

/**
 * Reference nav cart button (SVG + count badge; `.zero` hides the badge at 0).
 * Opens the slide-over drawer. The count is gated on hydration so the
 * server-rendered markup (count unknown → zero) matches the first client
 * paint, then reveals the real persisted count.
 */
export function CartButton() {
  const open = useCart((s) => s.open);
  const count = useCart(selectCount);
  const hydrated = useCartHydrated();
  const shown = hydrated ? count : 0;

  return (
    <button
      type="button"
      className="cart-btn"
      onClick={open}
      aria-label={
        shown > 0 ? `Cart, ${shown} item${shown === 1 ? "" : "s"}` : "Open cart"
      }
    >
      <CartIcon />
      <span className={`cart-count${shown === 0 ? " zero" : ""}`} aria-hidden>
        {shown}
      </span>
    </button>
  );
}
