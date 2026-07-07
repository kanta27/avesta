"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CartEmptyIcon } from "@/components/home/icons";
import { formatPaiseINR } from "@/lib/format";
import { lineKey } from "@/lib/cart/types";
import { useCart, useCartHydrated } from "@/lib/cart/store";
import { useCatalog, type ResolvedLine } from "./CatalogProvider";
import { waLink } from "@/components/store/whatsapp";

/** sessionStorage key the checkout form reads to prefill the discount field. */
export const CHECKOUT_DISCOUNT_KEY = "av_checkout_discount";

interface AppliedDiscount {
  code: string;
  discountPaise: number;
}

/**
 * Site-wide slide-over cart, rebuilt to the reference drawer markup
 * (`.overlay` + `.drawer` / `.ci` rows / `.promo` / `.totals` /
 * `.checkout-btns`) and wired to the real cart store + catalog join:
 *   - qty −/+ and Remove mutate the zustand cart (dec to 0 removes, like the
 *     reference);
 *   - the promo field validates against /api/discounts/validate (the same
 *     server engine checkout uses) and revalidates when the subtotal changes;
 *   - "Checkout securely" stores the applied code for checkout prefill and
 *     navigates to /checkout;
 *   - "Order on WhatsApp" builds the reference-format wa.me order message
 *     from the live lines.
 * Shipping shows FREE because checkout's pricing is free shipping today.
 */
export function CartDrawer() {
  const router = useRouter();
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.removeLine);
  const hydrated = useCartHydrated();
  const { resolve } = useCatalog();

  const panelRef = useRef<HTMLElement>(null);
  const lastFocused = useRef<Element | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [applied, setApplied] = useState<AppliedDiscount | null>(null);
  const [checking, setChecking] = useState(false);

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

  const resolved = hydrated
    ? items.map((line) => ({ line, key: lineKey(line), row: resolve(line) }))
    : [];
  const priced = resolved.filter(
    (r): r is typeof r & { row: ResolvedLine } => r.row !== null,
  );
  const subtotalPaise = priced.reduce(
    (sum, r) => sum + r.row.unitPaise * r.row.qty,
    0,
  );
  const discountPaise = Math.min(applied?.discountPaise ?? 0, subtotalPaise);
  const totalPaise = subtotalPaise - discountPaise;

  async function validateCode(code: string): Promise<void> {
    setChecking(true);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, subtotal_paise: subtotalPaise }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: boolean; code?: string; discount_paise?: number; reason?: string }
        | null;
      if (json?.ok && json.code) {
        setApplied({ code: json.code, discountPaise: json.discount_paise ?? 0 });
        setPromoMsg({
          ok: true,
          text: `✓ ${formatPaiseINR(json.discount_paise ?? 0)} off applied.`,
        });
        try {
          sessionStorage.setItem(CHECKOUT_DISCOUNT_KEY, json.code);
        } catch {
          /* storage unavailable — checkout field just starts empty */
        }
      } else {
        setApplied(null);
        setPromoMsg({ ok: false, text: json?.reason ?? "Invalid code." });
        try {
          sessionStorage.removeItem(CHECKOUT_DISCOUNT_KEY);
        } catch {
          /* ignore */
        }
      }
    } catch {
      setPromoMsg({ ok: false, text: "Could not check that code. Try again." });
    } finally {
      setChecking(false);
    }
  }

  // A percent code's amount depends on the subtotal — revalidate the applied
  // code whenever the subtotal changes (qty edits, removals).
  const appliedCode = applied?.code ?? null;
  useEffect(() => {
    if (!appliedCode || subtotalPaise === 0) return;
    void validateCode(appliedCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotalPaise]);

  function applyPromo() {
    const v = promoInput.trim().toUpperCase();
    if (!v || checking) return;
    void validateCode(v);
  }

  function goCheckout() {
    if (priced.length === 0) return;
    close();
    router.push("/checkout");
  }

  // WhatsApp order message — reference format, built from the live lines.
  const waLines = priced.map(
    (r) =>
      `${r.row.qty}× ${r.row.name}${r.row.packLabel ? ` (${r.row.packLabel})` : ""} — ${formatPaiseINR(r.row.unitPaise * r.row.qty)}`,
  );
  const waMsg =
    "Hi Avesta Wellbeing! I'd like to order:\n" +
    waLines.join("\n") +
    `\n\nSubtotal: ${formatPaiseINR(subtotalPaise)}` +
    (discountPaise > 0
      ? `\nDiscount (${applied?.code}): -${formatPaiseINR(discountPaise)}`
      : "") +
    `\nTotal: ${formatPaiseINR(totalPaise)}`;

  const hasLines = resolved.length > 0;

  return (
    <>
      <div
        className={`overlay${open ? " open" : ""}`}
        onClick={close}
        aria-hidden
      />
      <aside
        className={`drawer${open ? " open" : ""}`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="drawer-head">
          <h3>Your cart</h3>
          <button className="drawer-close" onClick={close} aria-label="Close cart">
            ×
          </button>
        </div>
        <div className="drawer-body">
          {!hasLines ? (
            <div className="cart-empty">
              <CartEmptyIcon />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            resolved.map(({ key, line, row }) =>
              row ? (
                <div className="ci" key={key}>
                  <div
                    className="ci-img"
                    style={
                      row.image
                        ? { backgroundImage: `url('${row.image.url}')` }
                        : { background: row.placeholder.background }
                    }
                  />
                  <div className="ci-main">
                    <h4>{row.name}</h4>
                    <div className="ci-meta">
                      {row.packLabel ? `${row.packLabel} pack` : "Bundle"}
                    </div>
                    <div className="qty">
                      <button
                        onClick={() =>
                          row.qty <= 1 ? removeLine(key) : setQty(key, row.qty - 1)
                        }
                        aria-label={`Decrease quantity of ${row.name}`}
                      >
                        −
                      </button>
                      <span>{row.qty}</span>
                      <button
                        onClick={() => setQty(key, row.qty + 1)}
                        aria-label={`Increase quantity of ${row.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="ci-right">
                    <div className="ci-price">
                      {formatPaiseINR(row.unitPaise * row.qty)}
                    </div>
                    <button
                      className="ci-remove"
                      onClick={() => removeLine(key)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ci" key={key}>
                  <div className="ci-img" aria-hidden>
                    {/* unavailable item — no image */}
                  </div>
                  <div className="ci-main">
                    <h4>This {line.kind} is no longer available</h4>
                    <div className="ci-meta">Remove it to continue.</div>
                  </div>
                  <div className="ci-right">
                    <button className="ci-remove" onClick={() => removeLine(key)}>
                      Remove
                    </button>
                  </div>
                </div>
              ),
            )
          )}
        </div>
        {hasLines ? (
          <div className="drawer-foot">
            <div className="promo">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPromo();
                }}
                placeholder="Discount code (try WELCOME10)"
                aria-label="Discount code"
                autoComplete="off"
                spellCheck={false}
              />
              <button onClick={applyPromo} disabled={checking}>
                Apply
              </button>
            </div>
            {promoMsg ? (
              <div
                className={`promo-msg ${promoMsg.ok ? "ok" : "err"}`}
                role="status"
              >
                {promoMsg.text}
              </div>
            ) : null}
            <div className="totals">
              <div className="tr">
                <span>Subtotal</span>
                <span>{formatPaiseINR(subtotalPaise)}</span>
              </div>
              {discountPaise > 0 ? (
                <div className="tr disc">
                  <span>Discount ({applied?.code})</span>
                  <span>−{formatPaiseINR(discountPaise)}</span>
                </div>
              ) : null}
              <div className="tr">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="tr grand">
                <span>Total</span>
                <span>{formatPaiseINR(totalPaise)}</span>
              </div>
            </div>
            <div className="checkout-btns">
              <button className="btn brass" onClick={goCheckout}>
                Checkout securely →
              </button>
              <a
                className="btn wa-btn"
                href={waLink(waMsg)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
