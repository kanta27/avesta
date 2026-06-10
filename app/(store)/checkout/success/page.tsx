import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your order has been placed.",
  alternates: { canonical: "/checkout/success" },
  robots: { index: false },
};

/**
 * Minimal post-payment landing page (feature 5). Shows the order number the
 * client was handed after a verified payment. The rich confirmation + receipt
 * (order details, tracking, re-order) is feature 6 — this is intentionally bare.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <section id="checkout-success">
      <div className="wrap checkout-success-wrap">
        <p className="checkout-success-emoji" aria-hidden>
          ✅
        </p>
        <h1 className="checkout-success-title">Order confirmed</h1>
        {order ? (
          <p className="checkout-success-sub">
            Thank you — your payment was successful. Your order number is{" "}
            <strong className="mono">{order}</strong>. A confirmation will follow
            shortly.
          </p>
        ) : (
          <p className="checkout-success-sub">
            Thank you — your payment was successful.
          </p>
        )}
        <Button variant="lime" href="/shop">
          Continue shopping
        </Button>
      </div>
    </section>
  );
}
