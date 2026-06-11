import type { Metadata } from "next";

import {
  PolicyLayout,
  Ph,
  CONSUMABLES_DISCLAIMER,
} from "@/components/content/PolicyLayout";

export const metadata: Metadata = {
  title: "Grievance Officer",
  description:
    "Contact details for the Avesta Health Grievance Officer, what to include in a complaint, and our response timeline.",
  alternates: { canonical: "/grievance" },
};

/** /grievance — Grievance Officer contact (feature 11). Displays the officer's
 *  name, email, phone and response SLA. Static; client-supplied values are
 *  [[ … ]] placeholders. */
export default function GrievancePage() {
  return (
    <PolicyLayout title="Grievance Officer" lastUpdated="11 June 2026">
      <p>
        In accordance with applicable Indian law — including the Consumer
        Protection (E-Commerce) Rules, 2020 and the Digital Personal Data
        Protection Act, 2023 — we have appointed a Grievance Officer to receive
        and resolve your complaints about our products, your orders, or the way
        we handle your personal data.
      </p>

      <h2>Contact details</h2>
      <dl className="policy-contact">
        <dt>Grievance Officer</dt>
        <dd>
          <Ph>grievance officer name</Ph>
        </dd>

        <dt>Entity</dt>
        <dd>
          <Ph>registered legal entity name</Ph>,{" "}
          <Ph>registered office address</Ph>
        </dd>

        <dt>Email</dt>
        <dd>
          <Ph>grievance officer email</Ph>
        </dd>

        <dt>Phone</dt>
        <dd>
          <Ph>grievance officer phone</Ph>
        </dd>
      </dl>

      <h2>What to include in your complaint</h2>
      <p>
        To help us resolve your complaint quickly, please include:
      </p>
      <ul>
        <li>your name and the contact details we can reach you on;</li>
        <li>
          your order number and the mobile number used at checkout, if your
          complaint relates to an order (you can find these on the{" "}
          <a href="/track">Track Order</a> page);
        </li>
        <li>a clear description of the issue; and</li>
        <li>
          any supporting evidence — for example unboxing proof for a damaged,
          incorrect or expired order (see our{" "}
          <a href="/refund">Refund &amp; Replacement Policy</a>).
        </li>
      </ul>

      <h2>Response timeline</h2>
      <p>
        We acknowledge complaints within <Ph>acknowledgement SLA, e.g. 48 hours</Ph>{" "}
        of receipt and aim to resolve them within{" "}
        <Ph>resolution SLA, e.g. 30 days</Ph>, in line with applicable law. If we
        need more information from you, the timeline may pause until you respond.
      </p>

      <h2>Data-protection grievances</h2>
      <p>
        For complaints specifically about your personal data — including requests
        to access, correct or erase your data, or to withdraw consent — please
        also see our <a href="/privacy">Privacy Policy</a>. The Grievance Officer
        above is your point of contact for these requests.
      </p>

      <p className="policy-disclaimer">{CONSUMABLES_DISCLAIMER}</p>
    </PolicyLayout>
  );
}
