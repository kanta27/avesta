// Build Article JSON-LD for a blog post detail page (spec feature 14 helpers
// live alongside product/organization here). Pure / client-safe.
import type { BlogPostDetail } from "@/lib/blog/types";

const BRAND = "Avesta Nordic";

/**
 * schema.org Article node for a published blog post.
 *
 * @param post the published post
 * @param url  the post's absolute canonical URL
 * @param siteOrigin canonical site origin (no trailing slash) — for publisher id
 */
export function articleJsonLd(
  post: BlogPostDetail,
  url: string,
  siteOrigin: string,
) {
  const origin = siteOrigin.replace(/\/$/, "");

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seoTitle ?? post.title,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    // Publisher ties back to the Organization node rendered in the root layout.
    publisher: { "@id": `${origin}/#organization`, "@type": "Organization", name: BRAND },
    // No per-author model yet; the brand is the author at baseline.
    author: { "@type": "Organization", name: BRAND },
  };

  const description = post.seoDescription ?? post.excerpt;
  if (description) node.description = description;

  if (post.cover?.url) node.image = [post.cover.url];

  if (post.publishedAt) {
    node.datePublished = post.publishedAt;
    // No separate modified timestamp tracked; mirror datePublished so the field
    // is present and valid rather than fabricating a different date.
    node.dateModified = post.publishedAt;
  }

  if (post.tags.length > 0) node.keywords = post.tags.join(", ");

  return node;
}
