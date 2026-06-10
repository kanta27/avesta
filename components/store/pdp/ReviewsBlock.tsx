import { starString } from "@/lib/products/placeholder";
import type { Review } from "@/lib/products/types";

/**
 * Approved reviews for the product. When there are none, shows a clear empty
 * state rather than fabricating testimonials (reviews are only ever created /
 * approved through the admin path).
 */
export function ReviewsBlock({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <p>No reviews yet.</p>
        <p className="mono">
          Verified reviews from customers will appear here once published.
        </p>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {reviews.map((r) => (
        <figure key={r.id} className="review">
          {r.rating != null ? (
            <div
              className="stars"
              aria-label={`Rated ${r.rating} out of 5`}
            >
              <span aria-hidden>{starString(r.rating)}</span>
            </div>
          ) : null}
          {r.body ? <blockquote>{r.body}</blockquote> : null}
          <figcaption>
            <span className="review-author">{r.authorName ?? "Verified buyer"}</span>
            {r.location ? <span className="review-loc"> · {r.location}</span> : null}
            {r.source ? (
              <span className="review-src mono"> · {r.source.toUpperCase()}</span>
            ) : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
