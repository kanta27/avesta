import type { Metadata } from "next";

import {
  PolicyLayout,
  Ph,
  CONSUMABLES_DISCLAIMER,
} from "@/components/content/PolicyLayout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "How and when Avesta Health orders are dispatched and delivered, including serviceable regions, timelines and charges.",
  alternates: { canonical: "/shipping" },
};

/** /shipping — Shipping Policy (feature 11). Static; client-supplied operational
 *  details (timelines, regions, charges) are marked as [[ … ]] placeholders. */
export default function ShippingPage() {
  return (
    <PolicyLayout title="Shipping Policy" lastUpdated="11 June 2026">
      <p>
        This Shipping Policy explains how orders placed on this website are
        processed, dispatched and delivered. It applies to all orders fulfilled
        by <Ph>registered legal entity name</Ph>,{" "}
        <Ph>registered office address</Ph> (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
        By placing an order you agree to the terms below.
      </p>

      <h2>Order processing</h2>
      <p>
        Orders are processed on business days (Monday to Saturday, excluding
        public holidays). Orders placed after our daily cut-off, or on a
        non-business day, are processed on the next business day. Once your
        payment is confirmed you will receive an order confirmation with your
        order number; a dispatch notification follows when your parcel leaves our
        warehouse.
      </p>
      <p>
        We aim to dispatch orders within{" "}
        <Ph>dispatch / handling time, e.g. 1–2 business days</Ph> of payment
        confirmation.
      </p>

      <h2>Delivery timelines</h2>
      <p>
        Estimated delivery time after dispatch is{" "}
        <Ph>delivery timeline, e.g. 3–7 business days</Ph>, depending on your
        location. Delivery timelines are estimates and not guarantees — they may
        be affected by courier delays, weather, regional restrictions or other
        events outside our control.
      </p>

      <h2>Serviceable regions</h2>
      <p>
        We currently ship to <Ph>serviceable regions / pin-code coverage</Ph>.
        If your delivery address falls outside our serviceable area, we will
        contact you using the details provided at checkout and refund any amount
        already paid.
      </p>

      <h2>Shipping charges</h2>
      <p>
        Applicable shipping charges, if any, are shown at checkout before you
        pay. <Ph>Free-shipping threshold / shipping charge details</Ph>.
      </p>

      <h2>Tracking your order</h2>
      <p>
        You can check the status of your order at any time from the{" "}
        <a href="/track">Track Order</a> page using your order number and the
        mobile number used at checkout. Where available, courier tracking
        details are shared in your dispatch notification.
      </p>

      <h2>Incorrect or incomplete addresses</h2>
      <p>
        Please ensure your delivery address and contact details are accurate.
        We are not responsible for delays or non-delivery caused by an incorrect
        or incomplete address. If a parcel is returned to us as undeliverable, we
        will contact you to arrange re-dispatch or a refund in line with our{" "}
        <a href="/refund">Refund &amp; Replacement Policy</a>.
      </p>

      <h2>Damaged, incorrect or missing items</h2>
      <p>
        If your order arrives damaged, incorrect or incomplete, please report it
        within 48 hours of delivery with unboxing proof, as set out in our{" "}
        <a href="/refund">Refund &amp; Replacement Policy</a>.
      </p>

      <h2>Questions</h2>
      <p>
        For any shipping-related queries, contact us at{" "}
        <Ph>support email</Ph>.
      </p>

      <p className="policy-disclaimer">{CONSUMABLES_DISCLAIMER}</p>
    </PolicyLayout>
  );
}
