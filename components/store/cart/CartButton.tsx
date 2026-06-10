"use client";

import { useCart, useCartHydrated, selectCount } from "@/lib/cart/store";

/**
 * Nav cart button with a live item-count badge. Opens the slide-over drawer.
 * The count is gated on hydration so the server-rendered markup (count unknown)
 * matches the first client paint, then reveals the real persisted count.
 */
export function CartButton() {
  const open = useCart((s) => s.open);
  const count = useCart(selectCount);
  const hydrated = useCartHydrated();
  const showCount = hydrated && count > 0;

  return (
    <button
      type="button"
      className="cart-btn"
      onClick={open}
      aria-label={
        showCount ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"
      }
    >
      <span aria-hidden>🛒</span>
      {showCount ? (
        <span className="cart-count" aria-hidden>
          {count}
        </span>
      ) : null}
    </button>
  );
}
