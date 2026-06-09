import { SectionHead } from "@/components/ui/SectionHead";

const CARDS = [
  {
    kicker: "Genomics",
    title: "What a landmark genome project teaches us about preventive health",
    body: "How population genetics shapes the future of personalized nutrition.",
  },
  {
    kicker: "Bioactives",
    title: "Plant molecules, pharma rigor: our natural-discovery pipeline",
    body: "From traditional Indian medicine to clinically validated ingredients.",
  },
  {
    kicker: "Nutrition Science",
    title: "Why hydration is more than water: the electrolyte evidence",
    body: "The clinical basis behind our glucose-optimized formulation.",
  },
] as const;

export function ResearchCards() {
  return (
    <section id="research">
      <div className="wrap">
        <SectionHead
          kicker="05 — The lab"
          title="Important research, made readable"
          description="Highlights from Avesthagen's published work — summarized for humans, linked to the original papers."
        />
        <div className="res-grid">
          {CARDS.map((c) => (
            <a className="res" key={c.title} href="#research">
              <span className="res-k">{c.kicker}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <div className="arrow" aria-hidden>
                →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
