import type { MetadataRoute } from "next";

import { publicEnv } from "@/lib/env";
import { getActiveProducts } from "@/lib/products/queries";
import { getPublishedSlugs } from "@/lib/blog/queries";
import { getAllConcernSlugs } from "@/lib/concerns/queries";

// Public, indexable URLs only (spec feature 14). Deliberately EXCLUDES
// /admin, /checkout, /checkout/success, /order/*, /cart, /track and /api — all
// non-indexable (and noindex at the metadata layer). The blog index + each
// PUBLISHED post join below (feature 16); concern landing pages join too
// (feature 19). Bundles is a single page for now.
//
// All URLs are absolute, built from NEXT_PUBLIC_SITE_URL (metadataBase origin).

const STATIC_PATHS = [
  { path: "/", priority: 1 },
  { path: "/shop", priority: 0.9 },
  { path: "/bundles", priority: 0.7 },
  { path: "/gallery", priority: 0.6 },
  { path: "/blog", priority: 0.6 },
  { path: "/for-professionals", priority: 0.5 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/refund", priority: 0.3 },
  { path: "/shipping", priority: 0.3 },
  { path: "/grievance", priority: 0.3 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority }) => ({
      url: `${origin}${path}`,
      changeFrequency: "weekly",
      priority,
    }),
  );

  // Active products only — getActiveProducts reads under RLS, so inactive rows
  // never surface here.
  const products = await getActiveProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${origin}/shop/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Published blog posts only — getPublishedSlugs reads under RLS, so drafts and
  // review posts never surface here.
  const posts = await getPublishedSlugs();
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${origin}/blog/${p.slug}`,
    lastModified: p.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Concern landing pages (feature 19). No status column — every row is public —
  // so getAllConcernSlugs reads them all under RLS.
  const concernSlugs = await getAllConcernSlugs();
  const concernEntries: MetadataRoute.Sitemap = concernSlugs.map((slug) => ({
    url: `${origin}/health-concern/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...productEntries,
    ...postEntries,
    ...concernEntries,
  ];
}
