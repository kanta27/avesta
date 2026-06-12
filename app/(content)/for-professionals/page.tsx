import type { Metadata } from "next";

import { B2bInquiryForm } from "@/components/store/B2bInquiryForm";

export const metadata: Metadata = {
  title: "For Doctors & Distributors",
  description:
    "Partner with Avesta Nordic. Wholesale and bulk enquiries for doctors, clinics, pharmacies and distributors — clinically formulated hydration and nutrition from Avesthagen's bioscience heritage.",
  alternates: { canonical: "/for-professionals" },
};

/** Who the partnership page speaks to — structure/function framing only, no
 *  therapeutic claims (conventions.md). Copy is intentionally about the commercial
 *  relationship, not product efficacy. */
const AUDIENCES = [
  {
    title: "Doctors & clinics",
    body: "Recommend clinically formulated hydration and daily nutrition to your patients, backed by Avesthagen's 25-year bioscience research.",
  },
  {
    title: "Pharmacies & chemists",
    body: "Stock fast-moving hydration drinks and nutrient gummies with reliable supply, clear margins and point-of-sale support.",
  },
  {
    title: "Distributors & wholesalers",
    body: "Carry the Avesta Nordic range across your territory with bulk pricing and a dedicated partnerships contact.",
  },
] as const;

const REASONS = [
  "Built on Avesthagen's 25-year bioscience and clinical-research heritage",
  "Manufactured to FSSAI standards with documented quality testing",
  "A focused range of hydration drinks and nutrient gummies for the Indian market",
  "Direct partnerships — no marketplace middlemen between you and the brand",
] as const;

/**
 * /for-professionals — B2B bulk-inquiry page (feature 15). Captures wholesale
 * interest from doctors / pharmacies / distributors without building a portal,
 * login or tiered pricing (that's feature 25, Phase 3). The form posts to the
 * shared POST /api/leads with `source_type: "b2b"`; submissions surface in the
 * admin Leads module tagged B2B. Lives in the (content) shell so it gets the
 * store chrome WITHOUT the consumer lead popup.
 */
export default function ForProfessionalsPage() {
  return (
    <section className="policy">
      <div className="wrap" style={{ maxWidth: 980, padding: "44px 0 90px" }}>
        <p className="mono" style={{ color: "var(--lime-deep)", letterSpacing: "0.04em" }}>
          WHOLESALE &amp; PARTNERSHIPS
        </p>
        <h1
          className="font-[family-name:var(--font-d)]"
          style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--ink)", marginTop: 8, lineHeight: 1.1 }}
        >
          For doctors &amp; distributors
        </h1>
        <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-grey">
          Avesta Nordic is Avesthagen&apos;s consumer health brand — clinically
          formulated hydration drinks and nutrient gummies for the Indian market.
          If you&apos;re a healthcare professional, pharmacy or distributor, tell us
          a little about your needs and our partnerships team will be in touch.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div
              key={a.title}
              className="rounded-card border border-line bg-white p-6"
            >
              <h2 className="font-[family-name:var(--font-d)] text-lg text-ink">
                {a.title}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-grey">{a.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-start">
          <div>
            <h2 className="font-[family-name:var(--font-d)] text-2xl text-ink">
              Why partner with us
            </h2>
            <ul className="mt-5 space-y-3">
              {REASONS.map((r) => (
                <li key={r} className="flex gap-3 text-[14.5px] text-grey">
                  <span aria-hidden className="text-lime-deep">
                    ✓
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[13px] leading-relaxed text-grey">
              These products are not intended to diagnose, treat, cure or prevent
              any disease.
            </p>
          </div>

          <div className="rounded-card border border-line bg-paper-2 p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-d)] text-xl text-ink">
              Bulk &amp; wholesale enquiry
            </h2>
            <p className="mb-6 mt-2 text-[13.5px] text-grey">
              No account needed — just send us your details.
            </p>
            <B2bInquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
