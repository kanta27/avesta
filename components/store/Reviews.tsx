import { SectionHead } from "@/components/ui/SectionHead";

const REVIEWS = [
  {
    stars: "★★★★★",
    quote:
      "I've tried every electrolyte powder out there. This is the first one where I could actually read the science behind it. The 90-day pack made it a habit.",
    initials: "RS",
    name: "Rahul S.",
    city: "BENGALURU",
    source: "AMAZON ✓",
  },
  {
    stars: "★★★★★",
    quote:
      "The immunity gummies are part of my kids' routine now. Knowing it comes from a real research company — not just an Instagram brand — matters to me.",
    initials: "PM",
    name: "Priya M.",
    city: "MUMBAI",
    source: "TATA 1MG ✓",
  },
  {
    stars: "★★★★☆",
    quote:
      "Ordered the hydration + gummy stack. Delivery was quick, and the WhatsApp tracking updates were a nice touch. Already reordered the monthly pack.",
    initials: "AK",
    name: "Arjun K.",
    city: "DELHI",
    source: "DIRECT ✓",
  },
] as const;

export function Reviews() {
  return (
    <section id="reviews">
      <div className="wrap">
        <SectionHead
          kicker="04 — Proof"
          title="Trusted by people, verified by platforms"
          description="Real reviews from verified buyers on Amazon and Tata 1mg — plus stories from our own customers."
        />
        <div className="rev-grid">
          {REVIEWS.map((r) => (
            <div className="rev" key={r.name}>
              <div className="stars" aria-hidden>
                {r.stars}
              </div>
              <p className="q">&ldquo;{r.quote}&rdquo;</p>
              <div className="who">
                <div className="av" aria-hidden>
                  {r.initials}
                </div>
                <div>
                  <b>{r.name}</b>
                  <span>{r.city}</span>
                </div>
                <span className="src">{r.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
