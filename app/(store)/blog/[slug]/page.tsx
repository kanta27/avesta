import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { publicEnv } from "@/lib/env";
import { getPublishedPostBySlug } from "@/lib/blog/queries";
import { articleJsonLd } from "@/lib/seo/article-jsonld";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/blog/Markdown";

type Params = Promise<{ slug: string }>;

// Revalidate so an admin publish/edit surfaces without a redeploy (the admin
// action also revalidates this path on publish).
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    // Unpublished/unknown: don't advertise a title, and keep it out of indexes.
    return { title: "Article not found", robots: { index: false } };
  }

  const title = post.seoTitle ?? post.title;
  const description =
    post.seoDescription ??
    post.excerpt ??
    `${post.title} — from the Avesta Nordic blog.`;
  const path = `/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${publicEnv.NEXT_PUBLIC_SITE_URL}${path}`,
      type: "article",
      siteName: "Avesta Nordic",
      locale: "en_IN",
      publishedTime: post.publishedAt ?? undefined,
      // Use the post's cover when present; otherwise fall back to the site OG
      // card so the share still carries an image (Next does not deep-merge OG).
      images: post.cover?.url ? [post.cover.url] : ["/opengraph-image"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const origin = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const url = `${origin}/blog/${post.slug}`;
  const articleLd = articleJsonLd(post, url, origin);

  return (
    <article id="blog-post">
      {/* Article structured data (SEO — feature 14). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <div className="wrap blog-article">
        <nav className="bc mono" aria-label="Breadcrumb">
          <Link href="/blog">Blog</Link> <span aria-hidden>/</span>{" "}
          <span aria-current="page">{post.title}</span>
        </nav>

        <header className="blog-article-head">
          {post.publishedAt ? (
            <time className="blog-card-date mono" dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          ) : null}
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="blog-article-lede">{post.excerpt}</p> : null}
          {post.tags.length > 0 ? (
            <ul className="blog-tags" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag} className="blog-tag mono">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {post.cover?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="blog-article-cover"
            src={post.cover.url}
            alt={post.cover.alt ?? ""}
          />
        ) : null}

        {/* body_md is UNTRUSTED — rendered through the sanitizing Markdown
            component (no raw HTML, allowlist sanitize). */}
        <Markdown source={post.bodyMd} />
      </div>
    </article>
  );
}
