/* eslint-disable @next/next/no-img-element */

/**
 * Reference partner-logo marquee. The reference duplicated the logo set with
 * JS for the seamless -50% loop; here the duplicate set is rendered statically
 * (aria-hidden) — same DOM, no script.
 */
const LOGOS = [
  { n: "Danone", src: "/home/logo-danone.png" },
  { n: "Nestlé", src: "/home/logo-nestle.png" },
  { n: "Limagrain", src: "/home/logo-limagrain.png" },
  { n: "bioMérieux", src: "/home/logo-biomerieux.png" },
  { n: "Godrej", src: "/home/logo-godrej.png" },
  { n: "Affymetrix", src: "/home/logo-affymetrix.png" },
] as const;

function LogoSet({ hidden }: { hidden?: boolean }) {
  return (
    <>
      {LOGOS.map((l) => (
        <div
          className="logo"
          title={l.n}
          key={`${l.n}${hidden ? "-dup" : ""}`}
          aria-hidden={hidden || undefined}
        >
          <img src={l.src} alt={hidden ? "" : l.n} loading="lazy" />
        </div>
      ))}
    </>
  );
}

export function Partners() {
  return (
    <div className="partners">
      <div className="wrap reveal">
        <div className="pl-label">Built with global food &amp; pharma leaders</div>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          <LogoSet />
          <LogoSet hidden />
        </div>
      </div>
    </div>
  );
}
