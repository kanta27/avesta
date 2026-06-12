import type { Metadata } from "next";

import {
  PolicyLayout,
  Ph,
  CONSUMABLES_DISCLAIMER,
} from "@/components/content/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Avesta Nordic collects, uses, stores and protects your personal data, your rights under the DPDP Act, 2023, and how to withdraw consent or request erasure.",
  alternates: { canonical: "/privacy" },
};

/** /privacy — Privacy Policy (feature 11). Must cover lead data + DPDP: the data
 *  captured via the lead popup, newsletter and B2B form; the explicit unticked
 *  consent basis; the single `leads` table; retention; and erasure / grievance
 *  contact. Static; client-supplied values are [[ … ]] placeholders. */
export default function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="11 June 2026">
      <p>
        This Privacy Policy explains how <Ph>registered legal entity name</Ph>,{" "}
        <Ph>registered office address</Ph> (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;) collects, uses, stores, shares and protects your
        personal data when you use this website. We process personal data in
        accordance with India&rsquo;s Digital Personal Data Protection Act, 2023
        (the &ldquo;DPDP Act&rdquo;) and other applicable law. By using this
        website you acknowledge the practices described here.
      </p>

      <h2>1. Information we collect</h2>
      <p>We collect the following categories of personal data:</p>
      <ul>
        <li>
          <strong>Marketing / lead data</strong> — your name, phone number and
          email address, collected when you submit them through our on-site lead
          popup, our newsletter signup, or our &ldquo;For Doctors &amp;
          Distributors&rdquo; (B2B) enquiry form. We also record which page you
          submitted from and, where you use our product quiz, your quiz answers.
        </li>
        <li>
          <strong>Order &amp; delivery data</strong> — when you place an order we
          collect your name, phone number, email address and delivery address so
          we can process and ship your order.
        </li>
        <li>
          <strong>Payment data</strong> — payments are processed by our
          third-party payment gateway. Your full card / banking details are
          entered with the gateway and are <strong>not</strong> stored by us; we
          retain only a payment reference and status to reconcile your order.
        </li>
        <li>
          <strong>Communications</strong> — records of messages we send you (for
          example order updates or, where you have consented, marketing messages
          on WhatsApp) and any correspondence you send us.
        </li>
      </ul>

      <h2>2. How marketing leads are stored</h2>
      <p>
        All marketing leads — whether captured via the lead popup, the
        newsletter signup or the B2B enquiry form — are stored together in a
        single <code>leads</code> record. Each record holds your name, phone and
        email (as provided), the source it came from, the page you submitted
        from, and — where relevant — your marketing-consent flag and the
        timestamp at which that consent was given.
      </p>

      <h2>3. Consent &amp; legal basis (DPDP)</h2>
      <p>
        Where we rely on your consent — in particular for sending you marketing
        communications over WhatsApp — that consent is obtained through an{" "}
        <strong>explicit, unticked opt-in checkbox</strong>. We never pre-tick
        it, and we record both that you consented and the date and time you did
        so. Marketing consent is optional: you can submit an enquiry, subscribe
        to order-related updates, or buy from us without agreeing to marketing
        messages.
      </p>
      <p>
        For data you provide to place and receive an order, our basis is the
        performance of that transaction and our legal and operational
        obligations connected to it.
      </p>

      <h2>4. How we use your information</h2>
      <ul>
        <li>To process, fulfil, ship and support your orders.</li>
        <li>
          To send you transactional messages such as order confirmations and
          delivery updates.
        </li>
        <li>
          To respond to your enquiries, including B2B (doctor / distributor)
          enquiries.
        </li>
        <li>
          To send you marketing communications <strong>only</strong> where you
          have given explicit consent, and to honour your withdrawal of that
          consent.
        </li>
        <li>
          To operate, secure and improve our website and protect against fraud
          and abuse.
        </li>
      </ul>

      <h2>5. Sharing your data</h2>
      <p>
        We do not sell your personal data. We share it only with service
        providers who help us run our business, and only as needed — for example
        our logistics / courier partners (to deliver your order), our payment
        gateway (to process payments) and our messaging provider (to send the
        communications described above). These providers are required to protect
        your data and use it only for the services they provide to us. We may
        also disclose data where required by law.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We retain your personal data only for as long as necessary for the
        purposes set out in this policy, or as required by applicable law. Lead
        data is retained for <Ph>lead-data retention period</Ph>, after which it
        is deleted or anonymised; order records are retained for{" "}
        <Ph>order-record retention period</Ph> to meet tax, accounting and
        warranty obligations. If you withdraw consent or request erasure, we act
        on your request as described below.
      </p>

      <h2>7. Your rights under the DPDP Act</h2>
      <p>Subject to applicable law, you have the right to:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>request correction of inaccurate or incomplete data;</li>
        <li>
          request <strong>erasure</strong> of your personal data where it is no
          longer required;
        </li>
        <li>
          <strong>withdraw consent</strong> at any time, where our processing is
          based on consent (withdrawal does not affect processing already carried
          out); and
        </li>
        <li>raise a grievance about how your data is handled.</li>
      </ul>
      <p>
        Every marketing message we send also includes a simple way to opt out.
      </p>

      <h2>8. How to withdraw consent or request erasure</h2>
      <p>
        To withdraw marketing consent, request access, correction or erasure of
        your data, or otherwise exercise your rights, contact us at{" "}
        <Ph>support email</Ph>, or contact our Grievance Officer (see below). We
        will verify and act on valid requests within the timelines required by
        law.
      </p>

      <h2>9. Grievance Officer</h2>
      <p>
        In line with applicable law we have appointed a Grievance Officer to
        address questions and complaints about your personal data. Their contact
        details and response timeline are on our{" "}
        <a href="/grievance">Grievance Officer</a> page.
      </p>

      <h2>10. Children</h2>
      <p>
        Our website and products are intended for adults. We do not knowingly
        collect personal data from children except as permitted by law and, where
        required, with verifiable consent of a parent or lawful guardian.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The
        &ldquo;Last updated&rdquo; date above reflects the most recent change.
        Material changes will be notified as required by law.
      </p>

      <h2>12. Contact us</h2>
      <p>
        For any privacy-related questions, contact us at <Ph>support email</Ph>,
        or write to <Ph>registered legal entity name</Ph>,{" "}
        <Ph>registered office address</Ph>.
      </p>

      <p className="policy-disclaimer">{CONSUMABLES_DISCLAIMER}</p>
    </PolicyLayout>
  );
}
