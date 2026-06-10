"use client";

import { useState } from "react";
import type { Bioactive } from "@/lib/products/types";

/**
 * "The Science" panel: a two-tab island toggling between the plain-language
 * mechanism (trusted admin `science_html`, rendered as-is per the spec note —
 * authors are first-party) and the linked research list (bioactive →
 * evidence_url). Research links are placeholders pending review.
 */
export function ScienceTabs({
  scienceHtml,
  bioactives,
}: {
  scienceHtml: string | null;
  bioactives: Bioactive[];
}) {
  const research = bioactives.filter((b) => b.evidence_url);
  const tabs = [
    scienceHtml ? { key: "how", label: "How it works" } : null,
    research.length > 0 ? { key: "research", label: "Research" } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  const [active, setActive] = useState(tabs[0]?.key ?? "how");

  if (tabs.length === 0) return null;

  return (
    <div className="science-tabs">
      <div role="tablist" aria-label="The science" className="science-tablist">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            role="tab"
            id={`science-tab-${t.key}`}
            aria-selected={active === t.key}
            aria-controls={`science-panel-${t.key}`}
            className={`science-tab${active === t.key ? " on" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {scienceHtml && active === "how" ? (
        <div
          role="tabpanel"
          id="science-panel-how"
          aria-labelledby="science-tab-how"
          className="science-panel science-prose"
          // Trusted first-party content (admin/seed); rendered as-is per spec.
          dangerouslySetInnerHTML={{ __html: scienceHtml }}
        />
      ) : null}

      {active === "research" ? (
        <div
          role="tabpanel"
          id="science-panel-research"
          aria-labelledby="science-tab-research"
          className="science-panel"
        >
          <ul className="research-list">
            {research.map((b) => (
              <li key={b.name}>
                <a href={b.evidence_url} target="_blank" rel="noopener noreferrer nofollow">
                  {b.name}
                </a>
                {b.role ? <span className="research-role"> — {b.role}</span> : null}
              </li>
            ))}
          </ul>
          <p className="research-note mono">
            Research links are placeholders pending review.
          </p>
        </div>
      ) : null}
    </div>
  );
}
