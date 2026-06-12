import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { getAllConcernSlugs } from "@/lib/concerns/queries";

// `slug` matches both the CONCERN_OPTIONS keys (used by /shop?concern=) and the
// concern_pages slug, so one value drives both link targets.
const CONCERNS = [
  { icon: "💧", name: "Hydration", count: "3 FORMULAS", slug: "hydration" },
  { icon: "⚡", name: "Energy", count: "2 FORMULAS", slug: "energy" },
  { icon: "🛡️", name: "Immunity", count: "2 FORMULAS", slug: "immunity" },
  { icon: "😴", name: "Sleep", count: "1 FORMULA", slug: "sleep" },
  { icon: "✨", name: "Hair & Skin", count: "1 FORMULA", slug: "hair-skin" },
  {
    icon: "🦴",
    name: "Daily Nutrition",
    count: "2 FORMULAS",
    slug: "daily-nutrition",
  },
] as const;

/**
 * Homepage "shop by concern" grid (feature 19 wiring).
 *
 * Each card links to its rich `/health-concern/[slug]` landing page IF a
 * concern_page exists for that slug, otherwise it falls back to the filtered
 * `/shop?concern=[slug]` — so no card can ever 404. Server component: it reads
 * the existing concern slugs under RLS.
 */
export async function ConcernGrid() {
  const concernSlugs = new Set(await getAllConcernSlugs());

  return (
    <section id="concerns">
      <div className="wrap">
        <SectionHead
          kicker="01 — Start here"
          title="Shop by health concern"
          description="Concern-first, not product-first. Tell us what your body needs — we'll match the formula."
        />
        <div className="concern-grid">
          {CONCERNS.map((c) => {
            const href = concernSlugs.has(c.slug)
              ? `/health-concern/${c.slug}`
              : `/shop?concern=${c.slug}`;
            return (
              <Link className="concern" key={c.name} href={href}>
                <div className="ic" aria-hidden>
                  {c.icon}
                </div>
                <h3>{c.name}</h3>
                <p>{c.count}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
