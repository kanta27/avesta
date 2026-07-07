/**
 * Reference testimonial wall — 1:1 markup/copy, incl. the reference's own
 * "illustrative reviews" disclaimer. The auto-scroll duplicate set is rendered
 * statically (rev-dup, aria-hidden) instead of by script.
 */
const REVIEWS = [
  {
    s: "★★★★★",
    t: '"My fasting glucose readings have been noticeably steadier since I started the Teestar gummies — and they’re genuinely easy to stick with."',
    n: "Rhea M.",
    av: "R",
    cat: "Blood Sugar",
    c: "var(--teal)",
  },
  {
    s: "★★★★★",
    t: '"The electrolyte sachets are part of my morning now. Light, not too sweet, and I feel properly hydrated through training."',
    n: "Arjun K.",
    av: "A",
    cat: "Hydration",
    c: "var(--brass)",
  },
  {
    s: "★★★★☆",
    t: '"Love that there’s real clinical science behind these, not just marketing. The immunity gummies are a family favourite."',
    n: "Priya S.",
    av: "P",
    cat: "Immunity",
    c: "var(--pine)",
  },
  {
    s: "★★★★★",
    t: '"AvestaDHA has made a real difference to my focus through long workdays — no jitters, just steadier concentration."',
    n: "Dev N.",
    av: "D",
    cat: "Focus",
    c: "#2f9e8f",
  },
  {
    s: "★★★★★",
    t: '"Started Bonephyte on my doctor’s nudge. Six months in, my latest scan numbers had actually improved."',
    n: "Meera R.",
    av: "M",
    cat: "Bone Health",
    c: "#27a9e0",
  },
  {
    s: "★★★★☆",
    t: '"ProVa Smartchol slotted into my routine easily, and my cholesterol panel is finally trending the right way."',
    n: "Karthik V.",
    av: "K",
    cat: "Cholesterol",
    c: "var(--teal)",
  },
  {
    s: "★★★★★",
    t: '"The ashwagandha blend takes the edge off my evenings. I’m sleeping deeper and waking up far less wired."',
    n: "Ananya G.",
    av: "A",
    cat: "Stress & Sleep",
    c: "var(--brass)",
  },
  {
    s: "★★★★★",
    t: '"AmlaPure is a daily habit now — clean label, no aftertaste, and backed by their own published research."',
    n: "Rohan T.",
    av: "R",
    cat: "Antioxidant",
    c: "var(--pine)",
  },
  {
    s: "★★★★★",
    t: '"WinterWell got our whole house through the season. Honestly fewer sick days for everyone this year."',
    n: "Sara F.",
    av: "S",
    cat: "Immunity",
    c: "#2f9e8f",
  },
] as const;

function Card({
  r,
  dup,
}: {
  r: (typeof REVIEWS)[number];
  dup?: boolean;
}) {
  return (
    <article
      className={`rev-card${dup ? " rev-dup" : ""}`}
      aria-hidden={dup || undefined}
      style={{ "--c": r.c } as React.CSSProperties}
    >
      <div className="s">{r.s}</div>
      <p>{r.t}</p>
      <div className="who">
        <div className="av">{r.av}</div>
        <div>
          <b>{r.n}</b>
          <div className="rmeta">
            <span className="vrf">Verified</span>
            <span className="rcat">{r.cat}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ReviewsWall() {
  return (
    <>
      <span className="anchor" id="reviews"></span>
      <section className="section" style={{ background: "#f2f8fb" }}>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Loved by customers</span>
            <h2>Real results, real reviews.</h2>
          </div>
          <div className="rev-head reveal">
            <div className="rev-score">
              <div className="rs-num">4.7</div>
              <div>
                <div className="s">★★★★★</div>
                <small>2,840+ verified ratings</small>
              </div>
            </div>
            <p className="lead">
              A growing community choosing food-first, clinically validated
              wellbeing — backed by 25 years of clinical science.
            </p>
          </div>
          <div className="rev-marquee reveal" aria-label="Customer testimonials">
            <div className="rev-track">
              {REVIEWS.map((r) => (
                <Card r={r} key={r.n + r.cat} />
              ))}
              {REVIEWS.map((r) => (
                <Card r={r} dup key={`dup-${r.n + r.cat}`} />
              ))}
            </div>
          </div>
          <p className="rev-note">
            Illustrative reviews shown for demonstration — replace with
            verified customer reviews at launch.
          </p>
        </div>
      </section>
    </>
  );
}
