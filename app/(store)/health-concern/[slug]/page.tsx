import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { publicEnv } from "@/lib/env";
import { getConcernPageBySlug } from "@/lib/concerns/queries";
import { getActiveProductsByIds } from "@/lib/products/queries";
import { faqJsonLd } from "@/lib/seo/product-jsonld";
import { medicalWebPageJsonLd } from "@/lib/seo/medical-webpage-jsonld";
import { Markdown } from "@/components/blog/Markdown";
import { ShopProductCard } from "@/components/store/ShopProductCard";

type Params = Promise<{ slug: string }>;

// Revalidate so an admin create/edit surfaces without a redeploy (the admin
// action also revalidates this path on save).
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getConcernPageBySlug(slug);

  if (!page) {
    // Unknown slug: don't advertise a title, and keep it out of indexes.
    return { title: "Page not found", robots: { index: false } };
  }

  const title = page.seoTitle ?? page.h1 ?? page.concern;
  const description =
    page.seoDescription ??
    `${page.concern} — formulas and answers from Avesta Nordic.`;
  const path = `/health-concern/${page.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${publicEnv.NEXT_PUBLIC_SITE_URL}${path}`,
      type: "website",
      siteName: "Avesta Nordic",
      locale: "en_IN",
      images: ["/opengraph-image"],
    },
  };
}

export default async function ConcernPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = await getConcernPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // product_ids → ACTIVE products only, in the admin-authored order.
  const products = await getActiveProductsByIds(page.productIds);

  const origin = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const url = `${origin}/health-concern/${page.slug}`;
  const medicalLd = medicalWebPageJsonLd(page, url, origin);
  const faqLd = faqJsonLd(page.faqs);

  const heading = page.h1 ?? page.concern;

  return (
    <article id="concern-page">
      {/* MedicalWebPage + FAQPage structured data (SEO — feature 19). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

      <div className="wrap blog-article">
        <nav className="bc mono" aria-label="Breadcrumb">
          <Link href="/shop">Shop</Link> <span aria-hidden>/</span>{" "}
          <span aria-current="page">{page.concern}</span>
        </nav>

        <header className="blog-article-head">
          <h1>{heading}</h1>
        </header>

        {/* intro_md is UNTRUSTED — rendered through the sanitizing Markdown
            component (no raw HTML, allowlist sanitize). */}
        <Markdown source={page.introMd} />

        {products.length > 0 ? (
          <section aria-labelledby="concern-products" className="mt-12">
            <h2
              id="concern-products"
              className="text-2xl font-semibold text-ink"
            >
              Formulas for {page.concern}
            </h2>
            <div className="prod-grid mt-6">
              {products.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}

        {page.faqs.length > 0 ? (
          <section aria-labelledby="concern-faqs" className="mt-12">
            <h2 id="concern-faqs" className="text-2xl font-semibold text-ink">
              Frequently asked questions
            </h2>
            <dl className="mt-6 divide-y divide-line border-t border-line">
              {page.faqs.map((f, i) => (
                <div key={i} className="py-5">
                  <dt className="font-medium text-ink">{f.q}</dt>
                  <dd className="mt-2 text-grey">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <p className="mt-12">
          <Link href={`/shop?concern=${page.slug}`} className="btn btn-primary">
            Shop all {page.concern}
          </Link>
        </p>
      </div>
    </article>
  );
}
