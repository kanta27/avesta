/* eslint-disable @next/next/no-img-element */

import { TileArrow } from "./icons";
import { RemoteImg } from "./RemoteImg";

/** Reference explore tile grid — 1:1 markup/copy. */
const TILES: {
  href: string;
  cat: string;
  title: string;
  img: string;
  alt: string;
  remote?: boolean;
}[] = [
  {
    href: "#avestagenome",
    cat: "Population genomics",
    title: "The Avestagenome Project®",
    img: "/home/tile-avestagenome.jpg",
    alt: "The Avestagenome Project — genomics lab and sequencing",
  },
  {
    href: "#diagnostics",
    cat: "Division DX",
    title: "Genetic Diagnostics",
    img: "/home/tile-diagnostics.jpg",
    alt: "Genetic diagnostics — cell analysis under microscope",
  },
  {
    href: "#nutrition",
    cat: "Division NU",
    title: "Nutrition & Functional Foods",
    img: "https://avesthagen.com/wp-content/uploads/2019/09/wellness-360x258.jpeg",
    alt: "Nutrition and functional foods",
    remote: true,
  },
  {
    href: "#pharma",
    cat: "Division RX",
    title: "Bio-Pharmaceuticals",
    img: "/home/tile-pharma.jpg",
    alt: "Bio-pharmaceuticals — antibody in bloodstream",
  },
  {
    href: "#crops",
    cat: "Division AG",
    title: "Environmentally Adjusted Crops™",
    img: "https://avesthagen.com/wp-content/uploads/2019/09/env-compressor.jpeg",
    alt: "Environmentally adjusted crops",
    remote: true,
  },
  {
    href: "#research",
    cat: "Worldwide",
    title: "Research & Global Network",
    img: "/home/tile-research.jpg",
    alt: "Global research network map",
  },
];

export function Explore() {
  return (
    <section
      className="section explore"
      style={{ paddingBottom: "clamp(20px,3vw,40px)" }}
    >
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Explore</span>
          <h2>
            One platform, many ways to <em>thrive</em>.
          </h2>
          <p>
            From at-home genome insights to clinically proven nutrition — find
            the part of Avesta Wellbeing that fits your life.
          </p>
        </div>
        <div className="tiles reveal">
          {TILES.map((t) => (
            <a className="tile" href={t.href} key={t.href}>
              {t.remote ? (
                <RemoteImg src={t.img} alt={t.alt} loading="lazy" />
              ) : (
                <img src={t.img} alt={t.alt} />
              )}
              <span className="t-cat">{t.cat}</span>
              <div className="t-label">
                <h3>{t.title}</h3>
                <span className="t-arrow">
                  <TileArrow />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
