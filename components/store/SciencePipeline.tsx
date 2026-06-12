import { Button } from "@/components/ui/Button";

const CHECKS = [
  "Every ingredient scientifically tested, every batch FSSAI licensed",
  "Structure-function claims only — no miracle promises, just evidence",
  "Research lineage published and linked on every product page",
  "Designed as 15-day clinical-style courses, not random consumption",
] as const;

const STEPS = [
  {
    n: "01",
    h: "Research",
    p: "Bioactive discovery from Avesthagen's genomics & natural-molecules programs.",
  },
  {
    n: "02",
    h: "Formulation",
    p: "Dosage and delivery engineered for absorption — drink or gummy.",
  },
  {
    n: "03",
    h: "Clinical validation",
    p: "Scientifically tested to pharma-rigor standards before launch.",
  },
  {
    n: "04",
    h: "Your daily ritual",
    p: "Shipped fresh, pan-India. Tracked to your door, reminders on WhatsApp.",
  },
] as const;

export function SciencePipeline() {
  return (
    <section id="science">
      <div className="wrap sci-grid">
        <div>
          <span className="mono uppercase tracking-[0.14em] text-[12px] text-lime-deep">
            03 — Why us
          </span>
          <h2 className="mt-3 text-[clamp(28px,3.4vw,42px)] font-extrabold">
            Built like a pharmaceutical. Enjoyed like a treat.
          </h2>
          <p>
            Most supplement brands start with marketing. We start in the lab.
            Every Avesta Nordic formula comes out of Avesthagen&apos;s 25-year
            pipeline of pharma-grade discovery — combining validated plant
            bioactives with modern clinical standards.
          </p>
          <ul className="checks">
            {CHECKS.map((c) => (
              <li key={c}>
                <span className="ck" aria-hidden>
                  ✓
                </span>
                {c}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 30 }}>
            <Button variant="primary" href="#research">
              Read our research →
            </Button>
          </div>
        </div>
        <div className="pipeline">
          <h3>From molecule to medicine cabinet</h3>
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <div className="n">{s.n}</div>
              <div>
                <h4>{s.h}</h4>
                <p>{s.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
