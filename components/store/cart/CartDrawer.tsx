"use client";

import { useEffect, useRef } from "react";
import { useCart, useCartHydrated, selectCount } from "@/lib/cart/store";
import { CartContents } from "./CartContents";

/**
 * Site-wide slide-over cart. Mounted once in the storefront layout; opened from
 * any add-to-cart button (the store's `open()` runs on add) and from the nav
 * cart button. Mirrors the LeadPopup's overlay pattern: backdrop click, Escape,
 * body-scroll lock, and focus management.
 */
export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const count = useCart(selectCount);
  const hydrated = useCartHydrated();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);

  // Never render the open drawer during SSR / first paint (persisted state is
  // client-only) — avoids a hydration mismatch.
  const open = hydrated && isOpen;

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      (lastFocused.current as HTMLElement | null)?.focus?.();
    };
  }, [open, close]);

  return (
    <div
      className={`cart-overlay${open ? " show" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-hidden={!open}
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        ref={panelRef}
      >
        <header className="cart-drawer-head">
          <h2 className="cart-drawer-title">
            Your cart
            {hydrated && count > 0 ? (
              <span className="cart-drawer-count mono">{count}</span>
            ) : null}
          </h2>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={close}
            aria-label="Close cart"
          >
            ✕
          </button>
        </header>
        {/* Render contents only once mounted so the empty/SSR state never
            flickers priced rows. */}
        {hydrated ? <CartContents variant="drawer" onNavigate={close} /> : null}
      </aside>
    </div>
  );
}
