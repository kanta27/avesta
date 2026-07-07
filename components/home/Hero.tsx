/* eslint-disable @next/next/no-img-element */

/** Reference hero — 1:1 markup/copy. */
export function Hero() {
  return (
    <section className="hero">
      <img
        className="sec-bg"
        src="/home/hero-bg.jpg"
        alt="Botanical science meets precision genomics"
        loading="eager"
        fetchPriority="high"
      />
      <div className="wrap">
        <div className="hero-copy">
          <span className="eyebrow">Bringing Science to Life · Est. 1998</span>
          <h1>
            Where botanical wisdom meets <em>precision genomics</em>.
          </h1>
          <p className="lead">
            For more than 25 years, we&apos;ve worked at the convergence of
            food, pharma and population genetics. Avesta Wellbeing brings that
            science home — predictive, preventive and personalized care,
            grounded in clinically validated nature.
          </p>
          <div className="hero-cta">
            <a className="btn" href="#science">
              Explore our science <span className="arr">→</span>
            </a>
            <a className="btn ghost" href="#shop">
              Shop wellbeing
            </a>
          </div>
        </div>

        <div className="hero-stats reveal">
          <div className="stat">
            <div className="num">
              25<span>+</span>
            </div>
            <div className="lbl">Years of science</div>
          </div>
          <div className="stat">
            <div className="num">10,000</div>
            <div className="lbl">
              Genome Project<sup></sup>
            </div>
          </div>
          <div className="stat">
            <div className="num">2,500</div>
            <div className="lbl">Medicinal plants</div>
          </div>
          <div className="stat">
            <div className="num">
              40<span>+</span>
            </div>
            <div className="lbl">Wellbeing products</div>
          </div>
        </div>
      </div>
    </section>
  );
}
