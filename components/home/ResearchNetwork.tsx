import { PinIcon } from "./icons";
import { RemoteImg } from "./RemoteImg";

/** Reference research / global network section — 1:1 markup/copy. */
export function ResearchNetwork() {
  return (
    <>
      <span className="anchor" id="research"></span>
      <section className="section insights" style={{ background: "#f2f8fb" }}>
        <RemoteImg
          className="sec-bg"
          src="https://avesthagen.com/wp-content/uploads/2019/09/drylab-compressor.jpeg"
          alt=""
          loading="lazy"
          style={{ opacity: 0.14 }}
        />
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Research &amp; Global Network</span>
            <h2>Discovery without borders.</h2>
            <p>
              Deep-tech R&amp;D subsidiaries across geographies extend our
              reach from the lab bench to global markets — and a donor-derived
              iPSC platform makes drug discovery faster, humanized and
              animal-free.
            </p>
          </div>

          <div className="net-grid reveal">
            <div className="net-card">
              <RemoteImg
                className="card-img"
                src="https://avesthagen.com/wp-content/uploads/2019/09/tech-360x258.jpeg"
                alt="Science and innovation"
                loading="lazy"
              />
              <div className="loc">
                <PinIcon /> United States
              </div>
              <h3>AGENOME LLC</h3>
              <p>
                Population genomics and life sciences focused on longevity —
                developing next-generation precision liquid-biopsy diagnostics
                and a proprietary 622-gene pan-cancer panel (ACCP) for early
                cancer risk prediction.
              </p>
            </div>
            <div className="net-card">
              <RemoteImg
                className="card-img"
                src="https://avesthagen.com/wp-content/uploads/2019/09/drylab-compressor.jpeg"
                alt="THE Dry Lab"
                loading="lazy"
              />
              <div className="loc">
                <PinIcon /> United Kingdom
              </div>
              <h3>AVGEN Ltd</h3>
              <p>
                Global variant discovery and population genomics — generating
                and expanding unique, disease-specific donor-derived iPSC cell
                lines for off-the-shelf therapeutic development across MHC
                barriers.
              </p>
            </div>
          </div>

          <div className="feature-row reveal">
            <div className="f">
              <svg className="ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="18" cy="18" r="6" />
                <circle cx="18" cy="18" r="13" />
                <circle cx="18" cy="5" r="2" fill="currentColor" />
              </svg>
              <h3>Donor-derived iPSC platform</h3>
              <p>
                Animal-free, humanized drug discovery and screening —
                leveraging 4,700 PBMC samples from the Avestagenome biobank.
              </p>
            </div>
            <div className="f">
              <svg className="ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 30h24M12 30V14M18 30V8M24 30V18" />
              </svg>
              <h3>2,500 plants · 15,000 compounds</h3>
              <p>
                One of the deepest catalogued libraries of medicinal botanicals
                and traceable compounds in the world.
              </p>
            </div>
            <div className="f">
              <svg className="ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 4h8M16 4v8l-7 16a3 3 0 0 0 3 4h12a3 3 0 0 0 3-4l-7-16V4" />
                <path d="M12 24h12" />
              </svg>
              <h3>Discovery to launch</h3>
              <p>
                An end-to-end R&amp;D engine — bioactive discovery, clinical
                testing, market research and commercial launch under one roof.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
