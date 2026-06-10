"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { formatPaiseINR } from "@/lib/format";
import { useCart, useCartHydrated } from "@/lib/cart/store";
import { useCatalog } from "@/components/store/cart/CatalogProvider";
import type { CartLine } from "@/lib/cart/types";

/**
 * Guest checkout form + order summary (feature 5).
 *
 * Flow: POST /api/checkout/create-order (server RE-PRICES from the DB) → pay →
 * POST /api/checkout/confirm (server verifies + marks paid) → /checkout/success.
 *
 * "Pay" branches on the provider the server reports:
 *   • mock  → POST /api/checkout/mock-pay to get a valid {paymentId, signature},
 *             then confirm. (No real modal exists in mock mode.)
 *   • razorpay → open Razorpay Checkout; its handler hands back the same trio,
 *             then confirm. This path is dormant until real keys exist.
 *
 * Money shown here is display-only (joined from the catalog); the server total
 * is authoritative.
 */

// --- Razorpay Checkout typings (real path; inert in mock mode) -----------------
interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill: { name: string; email?: string; contact: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface CreateOrderResponse {
  orderNumber: string;
  providerOrderId: string;
  amountPaise: number;
  providerName: string;
  keyId: string | null;
}

const FIELDS = {
  name: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  discountCode: "",
};
type FieldKey = keyof typeof FIELDS;

export function CheckoutForm() {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const { resolve } = useCatalog();
  const router = useRouter();

  const [fields, setFields] = useState<typeof FIELDS>(FIELDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  // Resolve cart refs against the live catalog for the summary, and keep the
  // raw refs (refs-only, exactly the create-order item shape) for the payload.
  // Lines whose product/bundle is no longer active are dropped from both.
  const payloadItems: CartLine[] = [];
  const summary = items
    .map((line) => {
      const row = resolve(line);
      if (row) payloadItems.push(line);
      return row;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const subtotalPaise = summary.reduce((s, r) => s + r.unitPaise * r.qty, 0);
  // Shipping is free for now (mirrors the server). Total === subtotal.
  const shippingPaise = 0;
  const totalPaise = subtotalPaise + shippingPaise;

  if (!hydrated) {
    return <p className="checkout-loading mono">Loading your cart…</p>;
  }

  if (payloadItems.length === 0) {
    return (
      <div className="checkout-empty">
        <p className="checkout-empty-title">Your cart is empty</p>
        <p className="checkout-empty-sub">
          Add a product or pack before checking out.
        </p>
        <Button variant="lime" href="/shop">
          Browse products
        </Button>
      </div>
    );
  }

  async function confirmAndRedirect(input: {
    providerOrderId: string;
    paymentId: string;
    signature: string;
  }) {
    const res = await fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        providerOrderId: input.providerOrderId,
        paymentId: input.paymentId,
        signature: input.signature,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "We couldn't verify your payment. Please try again.");
      setBusy(false);
      return;
    }
    // Payment confirmed — empty the cart and land on the confirmation page. The
    // order is already 'paid' server-side; the webhook would reconcile it even
    // if this redirect never happened.
    //
    // We route by the order's non-guessable UUID (`id`), never the sequential
    // order number — the confirmation page only accepts the UUID, so orders
    // can't be enumerated. If the id is somehow missing, fall back to the
    // shop rather than exposing a number-keyed page (there isn't one).
    clear();
    if (data.id) {
      router.push(`/order/confirmed?id=${encodeURIComponent(data.id)}`);
    } else {
      router.push("/shop");
    }
  }

  async function payWithRazorpay(order: CreateOrderResponse) {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay || !order.keyId) {
      setError("Could not load the payment gateway. Please try again.");
      setBusy(false);
      return;
    }
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.providerOrderId,
      amount: order.amountPaise,
      currency: "INR",
      name: "Avesta Health",
      description: order.orderNumber,
      prefill: {
        name: fields.name,
        email: fields.email || undefined,
        contact: fields.phone,
      },
      handler: (response) =>
        confirmAndRedirect({
          providerOrderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }),
      modal: {
        ondismiss: () => {
          setError("Payment was cancelled.");
          setBusy(false);
        },
      },
    });
    rzp.open();
  }

  async function payWithMock(order: CreateOrderResponse) {
    // No real modal in mock mode: ask the dev-only endpoint for a valid
    // {paymentId, signature}, then run the SAME confirm path a live payment uses.
    const res = await fetch("/api/checkout/mock-pay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ providerOrderId: order.providerOrderId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.paymentId || !data.signature) {
      setError("Mock payment failed. Please try again.");
      setBusy(false);
      return;
    }
    await confirmAndRedirect({
      providerOrderId: order.providerOrderId,
      paymentId: data.paymentId,
      signature: data.signature,
    });
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          customer: {
            name: fields.name,
            phone: fields.phone,
            email: fields.email,
          },
          address: {
            line1: fields.line1,
            line2: fields.line2,
            city: fields.city,
            state: fields.state,
            pincode: fields.pincode,
          },
          // Recorded only — no discount is applied yet (feature 8).
          discountCode: fields.discountCode || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const first = Array.isArray(data.issues) && data.issues[0]?.message;
        setError(first || data.error || "Could not start checkout.");
        setBusy(false);
        return;
      }

      const order = data as CreateOrderResponse;
      if (order.providerName === "razorpay" && order.keyId) {
        await payWithRazorpay(order);
      } else {
        await payWithMock(order);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="checkout-grid">
      <form className="checkout-fields" onSubmit={handlePay} noValidate>
        <h2 className="checkout-section-title">Delivery details</h2>

        <div className="field">
          <label className="checkout-label" htmlFor="co-name">
            Full name
          </label>
          <input
            id="co-name"
            value={fields.name}
            onChange={set("name")}
            autoComplete="name"
            required
          />
        </div>

        <div className="checkout-row">
          <div className="field">
            <label className="checkout-label" htmlFor="co-phone">
              Mobile number
            </label>
            <input
              id="co-phone"
              value={fields.phone}
              onChange={set("phone")}
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit mobile"
              required
            />
          </div>
          <div className="field">
            <label className="checkout-label" htmlFor="co-email">
              Email <span className="checkout-optional">(optional)</span>
            </label>
            <input
              id="co-email"
              value={fields.email}
              onChange={set("email")}
              inputMode="email"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field">
          <label className="checkout-label" htmlFor="co-line1">
            Address
          </label>
          <input
            id="co-line1"
            value={fields.line1}
            onChange={set("line1")}
            autoComplete="address-line1"
            placeholder="House no., street"
            required
          />
        </div>

        <div className="field">
          <label className="checkout-label" htmlFor="co-line2">
            Address line 2 <span className="checkout-optional">(optional)</span>
          </label>
          <input
            id="co-line2"
            value={fields.line2}
            onChange={set("line2")}
            autoComplete="address-line2"
            placeholder="Apartment, landmark"
          />
        </div>

        <div className="checkout-row">
          <div className="field">
            <label className="checkout-label" htmlFor="co-city">
              City
            </label>
            <input
              id="co-city"
              value={fields.city}
              onChange={set("city")}
              autoComplete="address-level2"
              required
            />
          </div>
          <div className="field">
            <label className="checkout-label" htmlFor="co-state">
              State
            </label>
            <input
              id="co-state"
              value={fields.state}
              onChange={set("state")}
              autoComplete="address-level1"
              required
            />
          </div>
        </div>

        <div className="field checkout-pincode">
          <label className="checkout-label" htmlFor="co-pincode">
            Pincode
          </label>
          <input
            id="co-pincode"
            value={fields.pincode}
            onChange={set("pincode")}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="6-digit"
            required
          />
        </div>

        {error ? (
          <p className="checkout-error" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          variant="lime"
          type="submit"
          className="checkout-pay"
          disabled={busy}
        >
          {busy ? "Processing…" : `Pay ${formatPaiseINR(totalPaise)}`}
        </Button>
        <p className="checkout-secure mono">
          Prepaid · secure payment. You won&apos;t be charged until you confirm.
        </p>
      </form>

      <aside className="checkout-summary" aria-label="Order summary">
        <h2 className="checkout-section-title">Order summary</h2>
        <ul className="checkout-lines">
          {summary.map((row) => (
            <li className="checkout-line" key={row.key}>
              <span
                className="checkout-line-thumb"
                style={
                  row.image ? undefined : { background: row.placeholder.background }
                }
              >
                {row.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.image.url} alt={row.image.alt ?? row.name} />
                ) : (
                  <span aria-hidden>{row.placeholder.emoji}</span>
                )}
              </span>
              <div className="checkout-line-main">
                <span className="checkout-line-name">{row.name}</span>
                {row.packLabel ? (
                  <span className="checkout-line-pack mono">{row.packLabel}</span>
                ) : null}
                <span className="checkout-line-qty mono">Qty {row.qty}</span>
              </div>
              <span className="checkout-line-price">
                {formatPaiseINR(row.unitPaise * row.qty)}
              </span>
            </li>
          ))}
        </ul>

        <div className="field checkout-discount">
          <label className="checkout-label" htmlFor="co-discount">
            Discount code <span className="checkout-optional">(optional)</span>
          </label>
          <input
            id="co-discount"
            value={fields.discountCode}
            onChange={set("discountCode")}
            autoComplete="off"
            spellCheck={false}
            placeholder="Have a code?"
          />
          {/* Recorded only — discount validation/redemption is feature 8. */}
        </div>

        <dl className="checkout-totals">
          <div className="checkout-total-row">
            <dt>Subtotal</dt>
            <dd>{formatPaiseINR(subtotalPaise)}</dd>
          </div>
          <div className="checkout-total-row">
            <dt>Shipping</dt>
            <dd>Free</dd>
          </div>
          <div className="checkout-total-row checkout-total-grand">
            <dt>Total</dt>
            <dd>{formatPaiseINR(totalPaise)}</dd>
          </div>
        </dl>

        <Link className="checkout-back" href="/cart">
          ← Back to cart
        </Link>
      </aside>
    </div>
  );
}
