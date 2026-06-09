import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/store/Counter";

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">
            <b aria-hidden>●</b> BY AVESTHAGEN · 25+ YEARS OF BIOSCIENCE
          </span>
          <h1>
            Medicine, rooted in <em>science.</em>
            <br />
            Made for every day.
          </h1>
          <p className="lead">
            Clinically formulated hydration drinks and nutrient gummies — built
            on Avesthagen&apos;s research heritage. Prevention, Precaution and
            Cure, in a form you&apos;ll actually enjoy.
          </p>
          <div className="hero-ctas">
            <Button variant="primary" href="#concerns">
              Shop by health concern →
            </Button>
            <Button variant="ghost" href="#science">
              Explore the science
            </Button>
          </div>
          <div className="stats">
            <div className="stat">
              <Counter end={25} suffix="+" />
              <div className="lab">Years of research</div>
            </div>
            <div className="stat">
              <Counter end={7} />
              <div className="lab">Clinically tested formulas</div>
            </div>
            <div className="stat">
              <Counter end={100} suffix="%" />
              <div className="lab">FSSAI licensed</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <svg className="helix" viewBox="0 0 400 560" fill="none" aria-hidden>
            <path
              d="M80 0 C 200 70, 200 130, 80 200 C 200 270, 200 330, 80 400 C 200 470, 200 530, 80 600"
              stroke="#0A3D3F"
              strokeOpacity=".14"
              strokeWidth="2"
            />
            <path
              d="M320 0 C 200 70, 200 130, 320 200 C 200 270, 200 330, 320 400 C 200 470, 200 530, 320 600"
              stroke="#9CCB1F"
              strokeOpacity=".3"
              strokeWidth="2"
            />
            <g stroke="#0A3D3F" strokeOpacity=".12">
              <line x1="110" y1="60" x2="290" y2="60" />
              <line x1="100" y1="140" x2="300" y2="140" />
              <line x1="110" y1="260" x2="290" y2="260" />
              <line x1="100" y1="340" x2="300" y2="340" />
              <line x1="110" y1="460" x2="290" y2="460" />
            </g>
          </svg>
          <div className="product-card-hero pc1">
            <div className="ph" aria-hidden>
              🥤
            </div>
            <div className="pch-name">HydraSci™ Electrolyte</div>
            <div className="pch-meta">RAPID HYDRATION · 15-DAY PACK</div>
          </div>
          <div className="product-card-hero pc2">
            <div className="ph" aria-hidden>
              🍬
            </div>
            <div className="pch-name">VitaGum™ Multivitamin</div>
            <div className="pch-meta">DAILY NUTRITION · 30 GUMMIES</div>
          </div>
          <div className="badge-float bf1">
            CLINICALLY TESTED <b aria-hidden>✓</b>
          </div>
        </div>
      </div>
    </section>
  );
}
