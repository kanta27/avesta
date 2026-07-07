import Link from "next/link";
import { FootMark, LinkedInIcon, XIcon, FacebookIcon } from "@/components/home/icons";
import { NewsletterSignup } from "@/components/store/NewsletterSignup";

/**
 * Reference footer, 1:1 markup/copy. Section links resolve as homepage anchors
 * (`/#…`); the Policies column points at the real legal routes instead of the
 * reference's `#contact` placeholders. The newsletter capture (ours, not in
 * the reference) lives under the brand blurb so the existing /api/leads
 * newsletter flow keeps working.
 */
const COLUMNS: {
  heading: string;
  links: { label: string; href: string }[];
}[] = [
  {
    heading: "Portfolio",
    links: [
      { label: "AVGEN Diagnostics", href: "/#diagnostics" },
      { label: "Nutrition & Foods", href: "/#nutrition" },
      { label: "Bio-Pharmaceuticals", href: "/#pharma" },
      { label: "Adjusted Crops™", href: "/#crops" },
    ],
  },
  {
    heading: "Science",
    links: [
      { label: "Our Science", href: "/#science" },
      { label: "Avestagenome Project®", href: "/#avestagenome" },
      { label: "Global Network", href: "/#research" },
      { label: "Insights", href: "/#insights" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our Story", href: "/#science" },
      { label: "Research", href: "/#research" },
      { label: "Careers", href: "/#contact" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund & Replacement", href: "/refund" },
      { label: "Grievance Redressal", href: "/grievance" },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="name">
              <FootMark />
              Avesta Wellbeing
            </div>
            <div className="sub">Bringing Science to Life · Est. 1998</div>
            <p>
              Bringing science to life — at the convergence of food, pharma and
              population genetics.
            </p>
            <NewsletterSignup />
          </div>
          {COLUMNS.map((col) => (
            <div className="foot-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="foot-bot">
          <small>© 2026 Avesta Wellbeing. All rights reserved.</small>
          <div className="foot-social">
            <a href="#" target="_blank" rel="noopener" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
            <a href="#" target="_blank" rel="noopener" aria-label="X / Twitter">
              <XIcon />
            </a>
            <a href="#" target="_blank" rel="noopener" aria-label="Facebook">
              <FacebookIcon />
            </a>
          </div>
        </div>
        <p className="disclaimer">
          This website includes statements, estimates, projections and other
          forward-looking statements regarding the anticipated future
          performance of the Company, based upon assumptions by management that
          may not prove correct. Such assumptions are inherently subject to
          significant uncertainties and contingencies. No representation is
          made, and no assurance can be given, that the Company will attain
          such results. Product candidates referenced may be in development and
          not yet approved for sale. Health-related information is provided for
          general purposes and is not a substitute for professional medical
          advice. Strictly private and confidential.
        </p>
      </div>
    </footer>
  );
}
