import { SectionHead } from "@/components/ui/SectionHead";
import {
  sourceLabel,
  starString,
  type FeaturedReview,
} from "@/lib/reviews/types";

/**
 * Homepage testimonials strip (feature 17). Driven by real `is_featured` +
 * approved reviews — the static placeholder cards were removed.
 *
 * Two card shapes, branched on source (compliance):
 *   - direct           → a first-party testimonial WITH on-site body text.
 *   - amazon | tata1mg → a link-out AGGREGATE BADGE: rating + platform link,
 *                        NEVER a verbatim third-party body.
 *
 * Renders nothing when there are no featured reviews yet (no fabricated proof).
 */

/** Up to two initials from a name, for the avatar chip. */
function initialsOf(name: string | null): string {
  if (!name) return "★";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]!.toUpperCase());
  return letters.join("") || "★";
}

export function Reviews({ reviews }: { reviews: FeaturedReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <section id="reviews">
      <div className="wrap">
        <SectionHead
          kicker="04 — Proof"
          title="Trusted by people, verified by platforms"
          description="Real reviews from verified buyers — plus aggregate ratings from Amazon and Tata 1mg."
        />
        <div className="rev-grid">
          {reviews.map((r) => {
            const thirdParty = r.source === "amazon" || r.source === "tata1mg";

            // Third-party: link-out badge, NO body.
            if (thirdParty && r.reelUrl) {
              return (
                <a
                  className="rev"
                  key={r.id}
                  href={r.reelUrl}
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                >
                  <div className="stars" aria-hidden>
                    {starString(r.rating)}
                  </div>
                  <p className="q">
                    {r.rating != null
                      ? `Rated ${r.rating.toFixed(1)} by verified buyers on `
                      : "Rated by verified buyers on "}
                    <b>{sourceLabel(r.source)}</b> ↗
                  </p>
                  <div className="who">
                    <span className="src">{sourceLabel(r.source!).toUpperCase()} ✓</span>
                  </div>
                </a>
              );
            }

            // First-party direct testimonial WITH body.
            return (
              <div className="rev" key={r.id}>
                <div className="stars" aria-hidden>
                  {starString(r.rating)}
                </div>
                {r.body ? <p className="q">&ldquo;{r.body}&rdquo;</p> : null}
                <div className="who">
                  <div className="av" aria-hidden>
                    {initialsOf(r.authorName)}
                  </div>
                  <div>
                    <b>{r.authorName ?? "Verified buyer"}</b>
                    {r.location ? <span>{r.location.toUpperCase()}</span> : null}
                  </div>
                  <span className="src">{sourceLabel(r.source).toUpperCase()} ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
