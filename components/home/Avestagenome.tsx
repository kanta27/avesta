"use client";

import { useEffect, useRef } from "react";
import { RemoteImg } from "./RemoteImg";

/**
 * Reference Avestagenome Project section — 1:1 markup/copy. Client component
 * for the "10,000" count-up (runs once when the figure scrolls into view;
 * reduced motion skips straight to the final figure). The cohort bar fill is
 * CSS-driven off the panel's `.reveal.in` state.
 */
export function Avestagenome() {
  const bigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bigRef.current;
    if (!el) return;

    let done = false;
    const target = 10000;
    const dur = 1400;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      el.innerHTML = "10<span>,</span>000";
    };
    const run = () => {
      if (done) return;
      done = true;
      if (reduced) {
        finish();
        return;
      }
      let t0: number | null = null;
      const step = (ts: number) => {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(step);
        else finish();
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              run();
              io.disconnect();
            }
          });
        },
        { threshold: 0.45 },
      );
      io.observe(el);
      return () => io.disconnect();
    }
    run();
  }, []);

  return (
    <>
      <span className="anchor" id="avestagenome"></span>
      <section className="section avgen">
        <RemoteImg
          className="sec-bg"
          src="https://avesthagen.com/wp-content/uploads/2019/09/genome-project-compressor.jpg"
          alt=""
          loading="lazy"
        />
        <div className="wrap">
          <div className="avgen-grid">
            <div className="reveal">
              <span className="eyebrow">The Avestagenome Project®</span>
              <h2>
                The world&apos;s largest systems-biology study of a single
                community — <em>decoding longevity</em>.
              </h2>
              <p>
                A landmark study of the Parsi-Zoroastrian population — among
                the longest-lived, most genetically distinct communities on
                earth — undertaken to understand the molecular basis of
                longevity and the rise of age-related disease.
              </p>
              <ul className="avgen-points">
                <li>
                  <span className="n">01</span>
                  <div>
                    <b>A living biobank</b>
                    <span>
                      Blood samples and longitudinal patient data from a first
                      cohort of 4,600, expanding toward 10,000.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="n">02</span>
                  <div>
                    <b>Druggable targets &amp; biomarkers</b>
                    <span>
                      A unique database of mitochondrial, nuclear and
                      epigenomic variants linked to cancer, Parkinson&apos;s,
                      Alzheimer&apos;s and rare disorders.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="n">03</span>
                  <div>
                    <b>One of the world&apos;s most valuable datasets</b>
                    <span>
                      Mapped DNA combined with medical, nutritional and
                      socio-economic data — fuelling drug development,
                      diagnostics and global partnerships.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="avgen-panel reveal">
              <span className="ap-chip">Study at a glance</span>
              <div className="big" ref={bigRef}>
                10<span>,</span>000
              </div>
              <div className="cap">Genome target · The Avestagenome Project®</div>
              <div className="cohort">
                <div className="cohort-top">
                  <span>Genomes sequenced</span>
                  <b>
                    46%<i>· 4,600 of 10,000</i>
                  </b>
                </div>
                <div className="cohort-bar">
                  <div className="cohort-fill"></div>
                </div>
              </div>
              <div className="ap-rows">
                <div className="row">
                  <span>iPSC source bank</span>
                  <b>4,700 PBMC samples</b>
                </div>
                <div className="row">
                  <span>Study type</span>
                  <b>Systems biology · first of its kind</b>
                </div>
                <div className="row">
                  <span>Population</span>
                  <b>Parsi-Zoroastrian</b>
                </div>
                <div className="row">
                  <span>Focus</span>
                  <b>Longevity &amp; aging disease</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
