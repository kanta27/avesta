"use client";

import { useId, useState } from "react";

/**
 * Public review form (feature 17) — what the post-delivery WhatsApp links to.
 * Posts to `POST /api/reviews`, which rate-limits, sanitizes, and stores the
 * submission as an UNAPPROVED first-party review for admin moderation. No auth:
 * anyone with the link can leave a review; nothing here is trusted server-side.
 */
export function ReviewForm({
  products,
}: {
  products: { id: string; name: string }[];
}) {
  const uid = useId();
  const fid = (n: string) => `${uid}-${n}`;

  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [location, setLocation] = useState("");
  const [productId, setProductId] = useState("");
  const [body, setBody] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          author_name: authorName,
          location,
          product_id: productId,
          body,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-card border border-line bg-paper-2 px-6 py-8 text-center">
        <p className="text-lg font-semibold">Thank you! 🙏</p>
        <p className="mt-2 text-sm text-grey">
          Your review has been submitted and will appear once our team approves
          it.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";
  const labelCls = "mb-1 block text-sm font-medium";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <p className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <fieldset>
        <legend className={labelCls}>Your rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating out of 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onClick={() => setRating(n)}
              className={`text-2xl leading-none transition-colors ${
                n <= rating ? "text-amber" : "text-line"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      {products.length > 0 && (
        <div>
          <label htmlFor={fid("product")} className={labelCls}>
            Which product? <span className="text-grey">(optional)</span>
          </label>
          <select
            id={fid("product")}
            className={inputCls}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">— Select a product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor={fid("body")} className={labelCls}>
          Your review
        </label>
        <textarea
          id={fid("body")}
          className={`${inputCls} min-h-32`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us about your experience…"
          required
          minLength={4}
          maxLength={4000}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("name")} className={labelCls}>
            Name <span className="text-grey">(optional)</span>
          </label>
          <input
            id={fid("name")}
            className={inputCls}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="How should we credit you?"
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor={fid("location")} className={labelCls}>
            City <span className="text-grey">(optional)</span>
          </label>
          <input
            id={fid("location")}
            className={inputCls}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Bengaluru"
            maxLength={120}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
