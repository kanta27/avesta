import type { CSSProperties } from "react";

/** Reference portfolio (Divisions DX / NU / RX / AG) — 1:1 markup/copy. */
export function Portfolio() {
  return (
    <section
      className="section"
      style={{ paddingBottom: "clamp(40px,5vw,72px)", overflowX: "clip" }}
    >
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">The Portfolio</span>
          <h2>Four divisions. One integrated platform.</h2>
          <p>
            Every asset below is catalogued like a specimen in our library — a
            single, traceable system spanning diagnostics, nutrition,
            pharmaceuticals and agriculture.
          </p>
        </div>

        {/* DIAGNOSTICS */}
        <span className="anchor" id="diagnostics"></span>
        <div
          className="division"
          style={{ paddingTop: 0, "--accent": "#27a9e0" } as CSSProperties}
        >
          <div className="div-head reveal">
            <div className="meta">
              <span className="div-mono">DX</span>
              <div className="div-code">Division DX · AVGEN Diagnostics</div>
              <h2>Know your genome. Act early.</h2>
              <p>
                A portfolio of NGS-driven tests bringing together precision
                gene panels and an AI-powered interpretation platform — backed
                by Congenica, an NHS-trusted, ISO 13485:2016 certified clinical
                genomics platform.
              </p>
            </div>
            <a className="textlink" href="#contact">
              Order a test →
            </a>
          </div>
          <div className="cards reveal">
            <div className="card">
              <div className="top">
                <span className="cat">No. DX-01 · Clinician initiated</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="8" y="5" width="24" height="30" rx="2" />
                  <path d="M14 13h12M14 20h12M14 27h7" />
                </svg>
              </div>
              <h3>AvestaScan®</h3>
              <div className="tt">Flagship NGS test</div>
              <p>
                High-quality whole-genome and exome genetic testing with
                best-in-class analysis powered by Congenica — the foundation
                for clinical decisions.
              </p>
              <div className="tags">
                <span>NGS</span>
                <span>Clinical</span>
                <span>Congenica</span>
              </div>
            </div>
            <div className="card">
              <div className="top">
                <span className="cat">No. DX-02 · Clinician initiated</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="20" cy="20" r="14" />
                  <path d="M20 6v28M6 20h28" strokeWidth="1" />
                  <circle cx="20" cy="20" r="5" />
                </svg>
              </div>
              <h3>CALiBRx®</h3>
              <div className="tt">624-gene risk panel</div>
              <p>
                An in-house curated panel using 19,652 probes across 624 genes
                and 15 fusion genes — for early detection of cancers,
                neurodegenerative and associated conditions.
              </p>
              <div className="tags">
                <span>624 genes</span>
                <span>Oncology</span>
                <span>Early detection</span>
              </div>
            </div>
            <div className="card">
              <div className="top">
                <span className="cat">No. DX-03 · Direct to consumer</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="12" y="4" width="16" height="32" rx="4" />
                  <path d="M18 8h4" strokeLinecap="round" />
                  <circle cx="20" cy="29" r="2.4" />
                </svg>
              </div>
              <h3>AvestaLife®</h3>
              <div className="tt">At-home genome insights</div>
              <p>
                AI-driven, actionable health recommendations based on your
                individual genome profile — with lifestyle guidance reviewed by
                experts, delivered to your phone.
              </p>
              <div className="tags">
                <span>Consumer</span>
                <span>AI report</span>
                <span>Lifestyle</span>
              </div>
            </div>
            <div className="card">
              <div className="top">
                <span className="cat">No. DX-04 · Platform</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 28l8-8 6 6 8-12 6 6" />
                  <circle cx="14" cy="20" r="2" />
                  <circle cx="28" cy="14" r="2" />
                </svg>
              </div>
              <h3>NGS Platform</h3>
              <div className="tt">Sequencing services</div>
              <p>
                Massively parallel next-generation sequencing — single-cell,
                transcriptomics, microbiome and expression analysis, with
                expert bioinformatics interpretation.
              </p>
              <div className="tags">
                <span>Single-cell</span>
                <span>Microbiome</span>
                <span>Bioinformatics</span>
              </div>
            </div>
          </div>
        </div>

        {/* NUTRITION */}
        <span className="anchor" id="nutrition"></span>
        <div
          className="division band"
          style={{ "--accent": "#5aa72f" } as CSSProperties}
        >
          <div className="div-head reveal">
            <div className="meta">
              <span className="div-mono">NU</span>
              <div className="div-code">
                Division NU · Nutrition &amp; Functional Foods
              </div>
              <h2>Clinically proven nature.</h2>
              <p>
                From a library of 2,500 medicinal plants and 15,000 catalogued
                compounds, we developed eight high-potential bioactives — and
                over 40 functional foods and supplements that prevent disease
                and support everyday wellbeing.
              </p>
            </div>
            <a className="textlink" href="#contact">
              Stock our range →
            </a>
          </div>
          <div className="cards reveal">
            <div className="card">
              <div className="ribbon">First in India</div>
              <div className="top">
                <span className="cat">No. NU-01 · Functional food</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M14 6c0 6-4 8-4 14a10 10 0 0 0 20 0c0-6-4-8-4-14"
                    strokeLinejoin="round"
                  />
                  <path d="M14 6h12" />
                </svg>
              </div>
              <h3>Teestar™ Gummies &amp; Crackers</h3>
              <div className="tt">Good Earth · blood-glucose support</div>
              <p>
                India&apos;s first clinically proven functional gummies and
                crackers containing Teestar™ — shown in clinical tests to help
                maintain stable blood glucose levels.
              </p>
              <div className="tags">
                <span>Glucose</span>
                <span>Clinically tested</span>
                <span>Good Earth</span>
              </div>
            </div>
            <div className="card">
              <div className="top">
                <span className="cat">No. NU-02 · Supplement line</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 6c-7 0-12 5-12 12 0 9 12 16 12 16s12-7 12-16c0-7-5-12-12-12Z" />
                  <path d="M20 14v10M15 19h10" />
                </svg>
              </div>
              <h3>Heart, Bone &amp; Mind</h3>
              <div className="tt">ProVa Smartchol · Bonephyte · ThinkWell</div>
              <p>
                Targeted bioactive formulations for cholesterol and heart
                health, bone density, and cognition — including AvestaDHA™ and
                Ashwagandha.
              </p>
              <div className="tags">
                <span>Heart</span>
                <span>Bone</span>
                <span>Cognition</span>
              </div>
            </div>
            <div className="card">
              <div className="top">
                <span className="cat">No. NU-03 · Immunity &amp; antioxidants</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="20" cy="20" r="6" />
                  <path
                    d="M20 4v6M20 30v6M4 20h6M30 20h6M9 9l4 4M27 27l4 4M31 9l-4 4M13 27l-4 4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>AmlaPure · GojiMax · WinterWell</h3>
              <div className="tt">Daily defense</div>
              <p>
                Antioxidant-rich botanicals to support immunity, energy and
                seasonal resilience — formulated and standardized for
                consistent potency.
              </p>
              <div className="tags">
                <span>Immunity</span>
                <span>Antioxidant</span>
                <span>Standardized</span>
              </div>
            </div>
            <div className="card">
              <div className="top">
                <span className="cat">No. NU-04 · Pipeline</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M10 6h20M14 6v10l-6 14a3 3 0 0 0 3 4h18a3 3 0 0 0 3-4l-6-14V6"
                    strokeLinejoin="round"
                  />
                  <path d="M11 26h18" />
                </svg>
              </div>
              <h3>Bioactive R&amp;D pipeline</h3>
              <div className="tt">Pre-clinical → proof of concept</div>
              <p>
                A pipeline of proprietary bioactives targeting diabetes,
                cardiovascular disease, osteoporosis, obesity, digestion and
                weight management — ready for partnership and licensing.
              </p>
              <div className="tags">
                <span>Licensing</span>
                <span>B2B</span>
                <span>40+ products</span>
              </div>
            </div>
          </div>
        </div>

        {/* PHARMA */}
        <span className="anchor" id="pharma"></span>
        <div
          className="division"
          style={{ "--accent": "#127fb3" } as CSSProperties}
        >
          <div className="div-head reveal">
            <div className="meta">
              <span className="div-mono">RX</span>
              <div className="div-code">Division RX · Bio-Pharmaceuticals</div>
              <h2>A biosimilar pipeline, de-risked.</h2>
              <p>
                Eight biosimilar molecules for cancers and autoimmune disorders
                — four advanced as lead candidates for Chronic Kidney Disease
                and Rheumatoid Arthritis, with stable cell lines producing
                commercially viable yields.
              </p>
            </div>
            <a className="textlink" href="#contact">
              Partner on co-development →
            </a>
          </div>
          <div className="pipeline reveal">
            <div className="ph">
              <div>Molecule</div>
              <div>Indication</div>
              <div>Stage</div>
              <div>Next step</div>
            </div>
            <div className="pr">
              <div className="mol">AVDESP™</div>
              <div>Chronic Kidney Disease</div>
              <div>
                <span className="stage scale">Scale-up ready</span>
              </div>
              <div>cGMP for clinical trials</div>
            </div>
            <div className="pr">
              <div className="mol">AVENT™</div>
              <div>Chronic Kidney Disease</div>
              <div>
                <span className="stage scale">Scale-up ready</span>
              </div>
              <div>cGMP for clinical trials</div>
            </div>
            <div className="pr">
              <div className="mol">AVCADE™</div>
              <div>Rheumatoid Arthritis</div>
              <div>
                <span className="stage pre">Stable cell line</span>
              </div>
              <div>Clinical evaluation</div>
            </div>
            <div className="pr">
              <div className="mol">AVPLASE™</div>
              <div>Autoimmune / RA</div>
              <div>
                <span className="stage pre">Stable cell line</span>
              </div>
              <div>Clinical evaluation</div>
            </div>
          </div>
          <p
            className="reveal"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: ".04em",
              color: "var(--muted)",
              marginTop: 16,
            }}
          >
            AVDESP™ &amp; AVENT™ have passed pre-clinical trials · 4 lead
            candidates of 8 in portfolio
          </p>
        </div>

        {/* CROPS */}
        <span className="anchor" id="crops"></span>
        <div
          className="division band"
          style={{ "--accent": "#2f9e8f" } as CSSProperties}
        >
          <div className="div-head reveal">
            <div className="meta">
              <span className="div-mono">AG</span>
              <div className="div-code">
                Division AG · Environmentally Adjusted Crops™
              </div>
              <h2>Standardizing nature at the source.</h2>
              <p>
                A deep portfolio of agricultural IP focused on biotic and
                abiotic stress resistance, oil enhancement and functional foods
                — now extended with CRISPR-based gene editing to improve crop
                traits, yields and biofuel output.
              </p>
            </div>
          </div>
          <div className="cards reveal">
            <div className="card">
              <div className="top">
                <span className="cat">No. AG-01 · Gene editing</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M12 8c8 6 8 18 16 24M28 8c-8 6-8 18-16 24"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="11" r="2" />
                  <circle cx="26" cy="29" r="2" />
                </svg>
              </div>
              <h3>CRISPR crop traits</h3>
              <div className="tt">Yield &amp; resilience</div>
              <p>
                Next-generation gene editing to improve crop traits and yields
                — ensuring standardization and effectiveness at the growing
                stage of the supply chain.
              </p>
              <div className="tags">
                <span>CRISPR</span>
                <span>Stress resistance</span>
              </div>
            </div>
            <div className="card">
              <div className="top">
                <span className="cat">No. AG-02 · Oil &amp; biofuel</span>
                <svg className="ico" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M20 6C14 14 10 18 10 24a10 10 0 0 0 20 0c0-6-4-10-10-18Z"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Enhanced oil yields</h3>
              <div className="tt">Functional &amp; sustainable</div>
              <p>
                Through the enhancement of selected genes, we develop crops
                that net significantly higher oil yields — improving both
                functional foods and biofuel output.
              </p>
              <div className="tags">
                <span>Biofuel</span>
                <span>Oil enhancement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
