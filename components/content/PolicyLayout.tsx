import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Consumables disclaimer — kept byte-identical to the footer's wording so the
 * claim is consistent everywhere it appears (conventions.md compliance rule).
 */
export const CONSUMABLES_DISCLAIMER =
  "These products are not intended to diagnose, treat, cure or prevent any disease.";

/**
 * Marks a value the client must still supply (registered entity, support email,
 * etc.). Rendered as a clearly-styled `[[ … ]]` chip so unfilled placeholders
 * are impossible to miss in review — never invent the real value.
 */
export function Ph({ children }: { children: ReactNode }) {
  return <span className="policy-ph">[[ {children} ]]</span>;
}

interface PolicyLayoutProps {
  /** Page heading, e.g. "Shipping Policy". */
  title: string;
  /** Human-readable last-updated date, e.g. "11 June 2026". */
  lastUpdated: string;
  /** Policy body — headings, paragraphs, lists. */
  children: ReactNode;
}

/**
 * Shared wrapper for the static legal/compliance pages (feature 11). Provides a
 * consistent prose column, the page title, a mono "last updated" line, and a
 * back-to-store link. Styling lives in the `.policy-*` block in globals.css and
 * reuses brand tokens only — no hardcoded colors.
 */
export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <section className="policy">
      <div className="wrap policy-wrap">
        <Link href="/" className="policy-back mono">
          ← Back to store
        </Link>
        <h1 className="policy-title">{title}</h1>
        <p className="policy-updated mono">Last updated: {lastUpdated}</p>
        <div className="policy-body">{children}</div>
      </div>
    </section>
  );
}
