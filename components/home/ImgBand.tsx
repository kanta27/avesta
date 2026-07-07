import { RemoteImg } from "./RemoteImg";

/** Reference credibility image banner — 1:1 markup/copy. */
export function ImgBand() {
  return (
    <section className="imgband">
      <RemoteImg
        className="sec-bg"
        src="https://avesthagen.com/wp-content/uploads/2019/09/healthcare-compressor.jpeg"
        alt=""
        loading="lazy"
      />
      <div className="wrap reveal">
        <span className="eyebrow">Trusted · Validated · Certified</span>
        <h2>Science you can stand behind.</h2>
        <p>
          Twenty-five years of peer-reviewed research, clinical validation and
          partnerships with the world&apos;s leading food and pharma houses —
          engineered to the highest standards.
        </p>
        <ul className="cred">
          <li>
            <b>ISO 13485:2016</b>
            <span>Clinical genomics</span>
          </li>
          <li>
            <b>NHS-trusted</b>
            <span>Congenica platform</span>
          </li>
          <li>
            <b>25+ years</b>
            <span>R&amp;D heritage</span>
          </li>
          <li>
            <b>US · UK · India</b>
            <span>Global network</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
