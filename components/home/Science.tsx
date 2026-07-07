/** Reference "Our Science" convergence section — 1:1 markup/copy. */
export function Science() {
  return (
    <>
      <span className="anchor" id="science"></span>
      <section className="section">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Our Science</span>
            <h2>A new paradigm for precision &amp; personalized care.</h2>
            <p>
              Healthcare is being revolutionized by genomic and stem-cell
              research. Avesta Wellbeing is built on a single integrated
              platform that lets us predict disease potential, prevent it
              through clinically validated nutrition, and personalize treatment
              to the individual.
            </p>
          </div>

          <div className="converge-grid">
            <div className="ppp reveal">
              <div className="ppp-item">
                <span className="ppp-badge">
                  <svg
                    className="ppp-ico"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M6 30c8-14 28-14 36 0" strokeLinecap="round" />
                    <circle cx="24" cy="22" r="6" />
                    <path d="M24 6v4M24 38v4" />
                  </svg>
                </span>
                <div>
                  <div className="k">01 · Predictive</div>
                  <h3>Read risk before it becomes disease</h3>
                  <p>
                    Next-generation sequencing and multi-omics analytics reveal
                    genetic predisposition to cancers, neurodegeneration and
                    metabolic conditions — years before symptoms.
                  </p>
                </div>
              </div>
              <div className="ppp-item">
                <span className="ppp-badge">
                  <svg
                    className="ppp-ico"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      d="M24 6c4 6 12 9 12 18a12 12 0 0 1-24 0c0-9 8-12 12-18Z"
                      strokeLinejoin="round"
                    />
                    <path d="M19 26c2 3 8 3 10 0" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <div className="k">02 · Preventive</div>
                  <h3>Food as the first medicine</h3>
                  <p>
                    Clinically validated botanical bioactives — drawn from a
                    library of 2,500 medicinal plants — help manage blood
                    glucose, heart, bone, cognition and immunity, reducing the
                    need for pharmaceuticals.
                  </p>
                </div>
              </div>
              <div className="ppp-item">
                <span className="ppp-badge">
                  <svg
                    className="ppp-ico"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle cx="24" cy="16" r="7" />
                    <path d="M10 40c2-8 8-12 14-12s12 4 14 12" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <div className="k">03 · Personalized</div>
                  <h3>One genome, one plan</h3>
                  <p>
                    AI-guided, actionable recommendations translate your
                    individual genome profile into lifestyle and nutrition
                    changes — reviewed and guided by experts.
                  </p>
                </div>
              </div>
            </div>

            <aside className="converge-aside reveal">
              <span className="conv-chip">Integrated platform</span>
              <h3>The convergence advantage</h3>
              <p>
                Most companies do one thing: a diagnostic, a supplement, a
                drug. Avesta Wellbeing is one of the only fully integrated
                platforms that can help you identify a health issue <em>and</em>{" "}
                address it — across nutrition, diagnostics and novel
                therapeutics.
              </p>
              <p>
                That integration is powered by world-class R&amp;D spanning
                systems biology, bioactive discovery, donor-derived iPSC
                stem-cell platforms and CRISPR agriculture — from discovery all
                the way to commercial launch.
              </p>
              <div className="conv-tags">
                <span>Food</span>
                <span>Pharma</span>
                <span>Population Genetics</span>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
