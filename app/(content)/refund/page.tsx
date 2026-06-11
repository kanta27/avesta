import type { Metadata } from "next";

import {
  PolicyLayout,
  Ph,
  CONSUMABLES_DISCLAIMER,
} from "@/components/content/PolicyLayout";

export const metadata: Metadata = {
  title: "Refund & Replacement",
  description:
    "When Avesta Health orders qualify for a replacement or refund, the 48-hour reporting window, the proof required, and how refunds are issued.",
  alternates: { canonical: "/refund" },
};

/** /refund — Refund / Replacement (feature 11). The headline statement is the
 *  compliance-approved wording and MUST stay verbatim. Static; client-supplied
 *  values are [[ … ]] placeholders. */
export default function RefundPage() {
  return (
    <PolicyLayout title="Refund &amp; Replacement" lastUpdated="11 June 2026">
      <p>
        Because our products are consumables, our refund and replacement policy
        is built around food-safety and hygiene. Please read the policy below
        before placing an order.
      </p>

      {/* Verbatim compliance-approved wording — do not edit. */}
      <p className="policy-callout">No returns on consumables; replacement/refund only for damaged, incorrect or expired orders reported within 48h with unboxing proof.</p>

      <h2>What qualifies</h2>
      <p>
        You may request a replacement or refund only where your order is:
      </p>
      <ul>
        <li>
          <strong>Damaged</strong> — the product or its sealed packaging arrived
          damaged or leaking;
        </li>
        <li>
          <strong>Incorrect</strong> — you received a different product, variant
          or quantity from what you ordered; or
        </li>
        <li>
          <strong>Expired</strong> — the product was past, or at, its expiry date
          on arrival.
        </li>
      </ul>

      <h2>The 48-hour reporting window</h2>
      <p>
        Claims must be reported within <strong>48 hours of delivery</strong>.
        Reports made after this window cannot be accepted, as we are unable to
        verify the condition of a consumable product beyond that point.
      </p>

      <h2>Unboxing proof required</h2>
      <p>
        A valid claim must include <strong>unboxing proof</strong> — a clear,
        continuous unboxing video and/or photographs that show the sealed outer
        packaging, the shipping label, and the issue with the product. This
        protects both you and us and lets us resolve genuine claims quickly. We
        may decline a claim that is not supported by adequate proof.
      </p>

      <h2>What is not eligible</h2>
      <p>
        We do not accept returns or offer refunds for change of mind, for opened
        or partially consumed products, or for issues reported after the 48-hour
        window, except where required by law. Damage caused by incorrect storage
        or handling after delivery is not eligible.
      </p>

      <h2>How to report a claim</h2>
      <p>
        Email <Ph>support email</Ph> within 48 hours of delivery with your order
        number, the mobile number used at checkout, a description of the issue,
        and your unboxing proof. You can find your order number on the{" "}
        <a href="/track">Track Order</a> page. We will review your claim and
        respond within <Ph>claim response time, e.g. 2–3 business days</Ph>.
      </p>

      <h2>Replacements &amp; refunds</h2>
      <p>
        Where a claim is approved, we will, at our discretion, send a replacement
        of the same product or issue a refund. Approved refunds are made to your
        original payment method and are typically credited within{" "}
        <Ph>refund processing time, e.g. 5–7 business days</Ph> of approval, after
        which the timing depends on your bank or payment provider.
      </p>

      <h2>Cancellations</h2>
      <p>
        If you need to cancel an order, contact us as soon as possible at{" "}
        <Ph>support email</Ph>. We can cancel and fully refund an order only
        while it has not yet been dispatched; once dispatched, the policy above
        applies.
      </p>

      <h2>Questions</h2>
      <p>
        For help with a refund or replacement, contact us at{" "}
        <Ph>support email</Ph>, or reach our{" "}
        <a href="/grievance">Grievance Officer</a> for unresolved concerns.
      </p>

      <p className="policy-disclaimer">{CONSUMABLES_DISCLAIMER}</p>
    </PolicyLayout>
  );
}
