"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import { createReviewAction } from "@/app/admin/(dashboard)/testimonials/actions";
import { REVIEW_SOURCES, sourceLabel, type ReviewSource } from "@/lib/reviews/types";

/**
 * Create-testimonial form (feature 17). Client component for state only — the
 * write is `createReviewAction` (requireAdmin + service role).
 *
 * COMPLIANCE, ENFORCED IN THE UI: the body field exists ONLY for source='direct'
 * (first-party). For amazon/tata1mg the form collects a rating + a REQUIRED
 * platform listing link and NO body at all — these become link-out aggregate
 * badges, never stored verbatim third-party text. The payload shape follows the
 * same split, so a body can't even be submitted for a third-party source.
 */

const inputCls =
  "w-full rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";
const labelCls = "mb-1 block text-sm font-medium";

export function ReviewCreateForm({
  products,
}: {
  products: { id: string; name: string }[];
}) {
  const router = useRouter();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  const [source, setSource] = useState<ReviewSource>("direct");
  const [productId, setProductId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState("5");
  const [body, setBody] = useState("");
  const [reelUrl, setReelUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirect = source === "direct";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Build the payload per source so a body never rides along on a third-party
    // submission (matches the discriminated-union schema on the server).
    const common = {
      author_name: authorName,
      location,
      rating: Number(rating),
      product_id: productId,
      reel_url: reelUrl,
      is_featured: isFeatured,
    };
    const payload = isDirect
      ? { ...common, source: "direct" as const, body }
      : { ...common, source };

    const res = await createReviewAction(payload);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    router.push("/admin/testimonials");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-semibold">New testimonial</h1>

      {error && (
        <p className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("source")} className={labelCls}>
            Source
          </label>
          <select
            id={fid("source")}
            className={inputCls}
            value={source}
            onChange={(e) => setSource(e.target.value as ReviewSource)}
          >
            {REVIEW_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s === "direct" ? "Direct (first-party)" : sourceLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={fid("product")} className={labelCls}>
            Product <span className="text-grey">(optional)</span>
          </label>
          <select
            id={fid("product")}
            className={inputCls}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">— General (no product) —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label htmlFor={fid("rating")} className={labelCls}>
            Rating
          </label>
          <select
            id={fid("rating")}
            className={inputCls}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={fid("author")} className={labelCls}>
            Author <span className="text-grey">(optional)</span>
          </label>
          <input
            id={fid("author")}
            className={inputCls}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Rahul S."
          />
        </div>
        <div>
          <label htmlFor={fid("location")} className={labelCls}>
            Location <span className="text-grey">(optional)</span>
          </label>
          <input
            id={fid("location")}
            className={inputCls}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Bengaluru"
          />
        </div>
      </div>

      {isDirect ? (
        <>
          <div>
            <label htmlFor={fid("body")} className={labelCls}>
              Review text
            </label>
            <textarea
              id={fid("body")}
              className={`${inputCls} min-h-28`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did the customer say?"
              required
            />
            <p className="mt-1 text-xs text-grey">
              First-party only. Stored and shown on-site as plain text.
            </p>
          </div>
          <div>
            <label htmlFor={fid("reel")} className={labelCls}>
              Reel URL <span className="text-grey">(optional)</span>
            </label>
            <input
              id={fid("reel")}
              className={inputCls}
              type="url"
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              placeholder="https://instagram.com/reel/…"
            />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor={fid("reel")} className={labelCls}>
            Platform listing link
          </label>
          <input
            id={fid("reel")}
            className={inputCls}
            type="url"
            value={reelUrl}
            onChange={(e) => setReelUrl(e.target.value)}
            placeholder="https://www.amazon.in/dp/…"
            required
          />
          <p className="mt-1 text-xs text-grey">
            {sourceLabel(source)} entries are rating + link-out badges only — no
            review text is stored or shown on-site (compliance).
          </p>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
        />
        Feature on homepage
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary text-sm disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create testimonial"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/testimonials")}
          className="btn btn-ghost text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
