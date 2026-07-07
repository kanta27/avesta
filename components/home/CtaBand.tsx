import { RemoteImg } from "./RemoteImg";

/** Reference CTA band — 1:1 markup/copy. */
export function CtaBand() {
  return (
    <section className="section cta-band">
      <RemoteImg
        className="sec-bg"
        src="https://avesthagen.com/wp-content/uploads/2019/09/tech-360x258.jpeg"
        alt=""
        loading="lazy"
      />
      <div className="wrap">
        <span className="eyebrow center" style={{ color: "var(--brass-soft)" }}>
          Predictive · Preventive · Personalized
        </span>
        <h2>
          Bring 25 years of science <em>into your life</em>.
        </h2>
        <p>
          Whether you&apos;re a consumer seeking a personalized health plan, a
          clinic ordering diagnostics, or a partner exploring licensing —
          let&apos;s talk.
        </p>
        <div className="btns">
          <a className="btn brass" href="#contact">
            Book a consultation
          </a>
          <a className="btn on-dark ghost" href="#nutrition">
            Explore products
          </a>
        </div>
      </div>
    </section>
  );
}
