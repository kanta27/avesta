import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { publicEnv } from "@/lib/env";
import { defaultTierIndex } from "@/lib/products/types";
import { getProductBySlug } from "@/lib/products/queries";
import {
  getApprovedAggregateBadges,
  getApprovedDirectReviews,
  getDirectReviewStats,
} from "@/lib/reviews/public";
import { starString } from "@/lib/products/placeholder";
import { faqJsonLd, productJsonLd } from "@/lib/seo/product-jsonld";

import { ProductGallery } from "@/components/store/pdp/ProductGallery";
import { ProductBuyBox } from "@/components/store/pdp/ProductBuyBox";
import { WhoForNotFor } from "@/components/store/pdp/WhoForNotFor";
import { ScienceTabs } from "@/components/store/pdp/ScienceTabs";
import { IngredientsTable } from "@/components/store/pdp/IngredientsTable";
import { BioactivesTable } from "@/components/store/pdp/BioactivesTable";
import { FaqAccordion } from "@/components/store/pdp/FaqAccordion";
import { ReviewsBlock } from "@/components/store/pdp/ReviewsBlock";
import { AggregateBadges } from "@/components/store/pdp/AggregateBadges";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const description =
    product.description ??
    product.tagline ??
    `${product.name} from Avesta Nordic.`;
  const path = `/shop/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: product.name,
      description,
      url: `${publicEnv.NEXT_PUBLIC_SITE_URL}${path}`,
      type: "website",
      siteName: "Avesta Nordic",
      locale: "en_IN",
      // Setting `openGraph` here replaces the root's openGraph wholesale (Next
      // does not deep-merge it), which drops the site-wide file-convention OG
      // image. Re-attach the default branded card so PDP social shares still
      // carry an image (per-PDP dynamic OG remains a future stretch).
      images: ["/opengraph-image"],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // First-party testimonials (with body) feed the reviews block; third-party
  // rows surface as separate link-out badges; the direct stats drive JSON-LD.
  const [reviews, aggregateBadges, directStats] = await Promise.all([
    getApprovedDirectReviews(product.id),
    getApprovedAggregateBadges(product.id),
    getDirectReviewStats(product.id),
  ]);

  const ratingNote =
    product.ratingAvg != null
      ? `${product.ratingAvg.toFixed(1)}${
          product.ratingSource ? ` · ${product.ratingSource.toUpperCase()}` : ""
        }`
      : null;

  const url = `${publicEnv.NEXT_PUBLIC_SITE_URL}/shop/${product.slug}`;
  const productLd = productJsonLd(product, url, directStats);
  const faqLd = faqJsonLd(product);

  return (
    <article id="pdp">
      {/* Product + FAQ structured data (SEO — feature 14's natural home). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

      <div className="wrap">
        <nav className="bc mono" aria-label="Breadcrumb">
          <Link href="/shop">Shop</Link> <span aria-hidden>/</span>{" "}
          <span aria-current="page">{product.name}</span>
        </nav>

        {/* ---- Top: gallery + buy area ---- */}
        <div className="pdp-top">
          <ProductGallery product={product} />

          <div className="pdp-summary">
            <h1>{product.name}</h1>
            {product.tagline ? (
              <p className="pdp-tagline">{product.tagline}</p>
            ) : null}
            {ratingNote ? (
              <div className="stars" aria-label={`Rated ${ratingNote}`}>
                <span aria-hidden>{starString(product.ratingAvg)}</span>{" "}
                <small>{ratingNote}</small>
              </div>
            ) : null}
            {product.description ? (
              <p className="pdp-desc">{product.description}</p>
            ) : null}

            <ProductBuyBox
              productId={product.id}
              productName={product.name}
              tiers={product.packTiers}
              defaultIndex={defaultTierIndex(product.packTiers)}
              badges={product.badges}
            />

            <p className="placeholder-note" role="note">
              Placeholder copy — product claims are pending Avesthagen sign-off.
            </p>
          </div>
        </div>

        {/* ---- Who for / not for ---- */}
        <WhoForNotFor whoFor={product.whoFor} whoNotFor={product.whoNotFor} />

        {/* ---- The Science ---- */}
        {(product.scienceHtml || product.bioactives.length > 0) && (
          <section className="pdp-section" aria-labelledby="science-h">
            <h2 id="science-h">The Science</h2>
            <ScienceTabs
              scienceHtml={product.scienceHtml}
              bioactives={product.bioactives}
            />
          </section>
        )}

        {/* ---- Ingredients & bioactives ---- */}
        {(product.ingredients.length > 0 || product.bioactives.length > 0) && (
          <section className="pdp-section pdp-tables" aria-labelledby="ing-h">
            <h2 id="ing-h">Ingredients &amp; bioactives</h2>
            <div className="pdp-tables-grid">
              {product.ingredients.length > 0 ? (
                <div>
                  <h3>Per serving</h3>
                  <IngredientsTable ingredients={product.ingredients} />
                </div>
              ) : null}
              {product.bioactives.length > 0 ? (
                <div>
                  <h3>Active bioactives</h3>
                  <BioactivesTable bioactives={product.bioactives} />
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* ---- FAQ ---- */}
        {product.faqs.length > 0 && (
          <section className="pdp-section" aria-labelledby="faq-h">
            <h2 id="faq-h">Frequently asked questions</h2>
            <FaqAccordion faqs={product.faqs} />
          </section>
        )}

        {/* ---- Reviews ---- */}
        <section className="pdp-section" aria-labelledby="rev-h">
          <h2 id="rev-h">Reviews</h2>
          {/* Third-party ratings link OUT (rating + link only — never a body). */}
          <AggregateBadges badges={aggregateBadges} />
          {/* First-party testimonials carry the on-site text. */}
          <ReviewsBlock reviews={reviews} />
        </section>
      </div>
    </article>
  );
}
