import type { Metadata } from "next";

import { getActiveProducts } from "@/lib/products/queries";
import { ReviewForm } from "@/components/store/ReviewForm";

export const metadata: Metadata = {
  title: "Leave a review",
  description:
    "Share your experience with Avesta Nordic products. Your review helps other customers choose with confidence.",
  alternates: { canonical: "/review" },
  // Submission page — keep it out of the index.
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ order?: string }>;

/**
 * Public review form page (feature 17). This is the destination of the
 * post-delivery WhatsApp review request. Submissions land UNAPPROVED
 * (source='direct', is_approved=false) for admin moderation. The `?order=`
 * param, if present, only personalises the copy — it is not stored.
 */
export default async function ReviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { order } = await searchParams;
  const products = await getActiveProducts();

  return (
    <section id="review-page">
      <div className="wrap" style={{ maxWidth: 640 }}>
        <h1>Leave a review</h1>
        <p className="lede">
          {order
            ? `Thanks for your order ${order} — we'd love to hear how it went.`
            : "We'd love to hear about your experience."}{" "}
          Your review is checked by our team before it appears on the site.
        </p>

        <div style={{ marginTop: 24 }}>
          <ReviewForm
            products={products.map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
      </div>
    </section>
  );
}
