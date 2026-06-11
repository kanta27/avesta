const COLUMNS = [
  {
    heading: "Shop",
    links: [
      "Hydration Drinks",
      "Gummy Supplements",
      "Combo Stacks",
      "90-Day Courses",
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "The Science", href: "#science" },
      { label: "Blog", href: "#blog" },
      { label: "For Doctors & Distributors", href: "/for-professionals" },
      { label: "Avesthagen.com ↗", href: "https://avesthagen.com" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Track Order", href: "/track" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Refund & Replacement", href: "/refund" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Grievance Officer", href: "/grievance" },
    ],
  },
] as const;

import { NewsletterSignup } from "@/components/store/NewsletterSignup";

function linkLabel(link: string | { label: string; href: string }) {
  return typeof link === "string" ? link : link.label;
}
function linkHref(link: string | { label: string; href: string }) {
  return typeof link === "string" ? "#" : link.href;
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="f-grid">
          <div>
            <div className="f-logo">● AVESTA HEALTH</div>
            <p>
              Clinically formulated hydration &amp; nutrition, built on
              Avesthagen&apos;s 25-year bioscience heritage. Prevention,
              Precaution and Cure.
            </p>
            <div className="f-cert">
              <span>FSSAI LIC. NO. XXXXXXX</span>
              <span>CLINICALLY TESTED</span>
              <span>RAZORPAY SECURED</span>
            </div>
            <NewsletterSignup />
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4>{col.heading}</h4>
              {col.links.map((link) => (
                <a key={linkLabel(link)} href={linkHref(link)}>
                  {linkLabel(link)}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="f-bottom">
          <span>© 2026 AVESTHAGEN LIMITED. ALL RIGHTS RESERVED.</span>
          <span>
            THESE PRODUCTS ARE NOT INTENDED TO DIAGNOSE, TREAT, CURE OR PREVENT
            ANY DISEASE.
          </span>
        </div>
      </div>
    </footer>
  );
}
