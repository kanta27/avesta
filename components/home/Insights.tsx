/** Reference insights section — 1:1 markup/copy. */
export function Insights() {
  return (
    <>
      <span className="anchor" id="insights"></span>
      <section className="section insights">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Insights &amp; Research</span>
            <h2>From the lab notebook.</h2>
            <p>
              Peer-reviewed science, published findings and the thinking behind
              predictive, preventive, personalized care.
            </p>
          </div>
          <div className="ins-grid reveal">
            <article className="ins-card">
              <div
                className="ins-img"
                style={{
                  backgroundImage:
                    "url('https://avesthagen.com/wp-content/uploads/2019/09/genome-project-compressor.jpg')",
                }}
              ></div>
              <div className="kicker">
                <span>Genomics</span>
                <span>2020</span>
              </div>
              <h3>
                The first complete Zoroastrian-Parsi mitochondrial reference
                genome
              </h3>
              <p>
                A milestone release establishing mitochondrial signatures in an
                endogamous, non-smoking population — and what it tells us about
                longevity.
              </p>
              <a className="textlink" href="#contact">
                Read more →
              </a>
            </article>
            <article className="ins-card">
              <div
                className="ins-img"
                style={{
                  backgroundImage:
                    "url('https://avesthagen.com/wp-content/uploads/2019/09/healthcare-compressor.jpeg')",
                }}
              ></div>
              <div className="kicker">
                <span>Oncology</span>
                <span>2020</span>
              </div>
              <h3>Genetic predictors for tobacco-related cancers</h3>
              <p>
                How NGS profiling of circulating free DNA and RNA in smoking
                subjects can deliver qualified biomarkers for early cancer
                risk.
              </p>
              <a className="textlink" href="#contact">
                Read more →
              </a>
            </article>
            <article className="ins-card">
              <div
                className="ins-img"
                style={{
                  backgroundImage:
                    "url('https://avesthagen.com/wp-content/uploads/2019/09/wellness-360x258.jpeg')",
                }}
              ></div>
              <div className="kicker">
                <span>Nutrition</span>
                <span>Clinical</span>
              </div>
              <h3>Teestar™ and stable blood glucose</h3>
              <p>
                The clinical story behind India&apos;s first functional food
                and gummy proven to help manage stable blood glucose levels.
              </p>
              <a className="textlink" href="#contact">
                Read more →
              </a>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
