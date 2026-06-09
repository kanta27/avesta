import { SectionHead } from "@/components/ui/SectionHead";

const CONCERNS = [
  { icon: "💧", name: "Hydration", count: "3 FORMULAS" },
  { icon: "⚡", name: "Energy", count: "2 FORMULAS" },
  { icon: "🛡️", name: "Immunity", count: "2 FORMULAS" },
  { icon: "😴", name: "Sleep", count: "1 FORMULA" },
  { icon: "✨", name: "Hair & Skin", count: "1 FORMULA" },
  { icon: "🦴", name: "Daily Nutrition", count: "2 FORMULAS" },
] as const;

export function ConcernGrid() {
  return (
    <section id="concerns">
      <div className="wrap">
        <SectionHead
          kicker="01 — Start here"
          title="Shop by health concern"
          description="Concern-first, not product-first. Tell us what your body needs — we'll match the formula."
        />
        <div className="concern-grid">
          {CONCERNS.map((c) => (
            <div className="concern" key={c.name}>
              <div className="ic" aria-hidden>
                {c.icon}
              </div>
              <h3>{c.name}</h3>
              <p>{c.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
