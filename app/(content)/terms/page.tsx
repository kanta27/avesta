import type { Metadata } from "next";

import {
  PolicyLayout,
  Ph,
  CONSUMABLES_DISCLAIMER,
} from "@/components/content/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms governing your use of the Avesta Health website and your purchase of our products.",
  alternates: { canonical: "/terms" },
};

/** /terms — Terms & Conditions (feature 11). Static; client-supplied values
 *  (entity, contact, governing-law city) are [[ … ]] placeholders. */
export default function TermsPage() {
  return (
    <PolicyLayout title="Terms &amp; Conditions" lastUpdated="11 June 2026">
      <p>
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to
        and use of this website and your purchase of products from{" "}
        <Ph>registered legal entity name</Ph>,{" "}
        <Ph>registered office address</Ph> (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;). By accessing this website or placing an order, you
        agree to these Terms. Please read them together with our{" "}
        <a href="/privacy">Privacy Policy</a>,{" "}
        <a href="/shipping">Shipping Policy</a> and{" "}
        <a href="/refund">Refund &amp; Replacement Policy</a>, which are
        incorporated by reference.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 18 years old and able to enter into a legally
        binding contract to purchase from this website. By placing an order you
        confirm that the information you provide is accurate and that you are
        buying for personal, non-resale use unless we have separately agreed
        otherwise in writing.
      </p>

      <h2>2. Products &amp; information</h2>
      <p>
        Our products are food / nutritional products intended to support general
        wellbeing as part of a balanced diet and healthy lifestyle. Product
        descriptions, claims and imagery are provided for general information
        only and describe the structure and function of the product. They are
        not medical advice and are not a substitute for consultation with a
        qualified healthcare professional. Always read the label and directions
        before use, and consult your physician if you are pregnant, nursing,
        taking medication or have a medical condition.
      </p>
      <p>
        We take care to describe products accurately, but we do not warrant that
        descriptions, colours or other content are error-free. Packaging and
        formulations may be updated; the information accompanying the product you
        receive prevails.
      </p>

      <h2>3. Pricing &amp; payment</h2>
      <p>
        All prices are listed in Indian Rupees (₹) and, unless stated otherwise,
        are inclusive of applicable taxes. The total payable, including any
        shipping charges, is shown at checkout before you pay. We re-confirm the
        price of every order at checkout; in the event of an obvious pricing
        error we may cancel the affected order and refund any amount paid.
        Payments are processed by our third-party payment gateway, and orders are
        prepaid unless we expressly offer another method.
      </p>

      <h2>4. Orders &amp; acceptance</h2>
      <p>
        Your order is an offer to buy. A contract is formed only when we confirm
        dispatch of your order. We may decline or cancel an order — for example
        where a product is unavailable, where the delivery address is outside our
        serviceable area, where we suspect fraud or misuse, or because of a
        pricing or stock error. If we cancel an order you have paid for, we refund
        the amount paid.
      </p>

      <h2>5. Discount codes &amp; promotions</h2>
      <p>
        Discount codes and promotions are subject to their own terms, including
        validity periods, minimum-order requirements and usage limits, and may be
        withdrawn or amended at any time. Codes have no cash value, cannot be
        combined unless stated, and may not be transferred or resold.
      </p>

      <h2>6. Shipping, returns &amp; refunds</h2>
      <p>
        Delivery is governed by our <a href="/shipping">Shipping Policy</a>.
        Returns, replacements and refunds are governed by our{" "}
        <a href="/refund">Refund &amp; Replacement Policy</a>. In summary, there
        are no returns on consumables; replacement or refund is available only for
        damaged, incorrect or expired orders reported within 48 hours with
        unboxing proof.
      </p>

      <h2>7. Acceptable use</h2>
      <p>
        You agree not to misuse this website — including by attempting to gain
        unauthorised access, interfering with its operation or security, scraping
        or harvesting data, or using it for any unlawful purpose. We may suspend
        or terminate access for any breach of these Terms.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        All content on this website — including text, graphics, logos, product
        names and imagery — is owned by or licensed to us and is protected by
        applicable intellectual-property laws. You may not copy, reproduce or use
        it without our prior written permission.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect or
        consequential loss arising from your use of this website or our products,
        and our total liability in connection with an order is limited to the
        amount you paid for that order. Nothing in these Terms excludes any
        liability that cannot lawfully be excluded, including liability for death
        or personal injury caused by our negligence.
      </p>

      <h2>10. Governing law &amp; jurisdiction</h2>
      <p>
        These Terms are governed by the laws of India, and the courts at{" "}
        <Ph>governing-law jurisdiction / city</Ph> shall have exclusive
        jurisdiction over any dispute arising out of or in connection with them.
      </p>

      <h2>11. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The &ldquo;Last
        updated&rdquo; date above reflects the most recent change, and the Terms
        in force at the time you place an order apply to that order.
      </p>

      <h2>12. Contact &amp; grievances</h2>
      <p>
        For questions about these Terms, contact us at <Ph>support email</Ph>.
        For complaints, you may also contact our{" "}
        <a href="/grievance">Grievance Officer</a>.
      </p>

      <p className="policy-disclaimer">{CONSUMABLES_DISCLAIMER}</p>
    </PolicyLayout>
  );
}
