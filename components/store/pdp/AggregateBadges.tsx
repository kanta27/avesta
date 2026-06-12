import { sourceLabel, starString, type AggregateBadge } from "@/lib/reviews/types";

/**
 * Third-party AGGREGATE RATING BADGES for the PDP (Amazon / Tata 1mg). Each is a
 * rating + a link OUT to the platform listing — NEVER a verbatim review body
 * (compliance / Google policy). The body column is never even fetched for these
 * rows. Renders nothing when there are no approved third-party badges.
 *
 * These are deliberately separate from the first-party `ReviewsBlock`: only
 * first-party (`source='direct'`) reviews carry on-site testimonial text.
 */
export function AggregateBadges({ badges }: { badges: AggregateBadge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="agg-badges">
      {badges.map((b) =>
        b.url ? (
          <a
            key={b.id}
            href={b.url}
            target="_blank"
            rel="noreferrer noopener nofollow"
            className="agg-badge"
          >
            <span className="stars" aria-hidden>
              {starString(b.rating)}
            </span>
            <span className="agg-badge-label">
              {b.rating != null ? `Rated ${b.rating.toFixed(1)} on ` : "Rated on "}
              <b>{sourceLabel(b.source)}</b> ↗
            </span>
          </a>
        ) : null,
      )}
    </div>
  );
}
