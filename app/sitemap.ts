import type { MetadataRoute } from "next";

import { publicEnv } from "@/lib/env";
import { getActiveProducts } from "@/lib/products/queries";

// Public, indexable URLs only (spec feature 14). Deliberately EXCLUDES
// /admin, /checkout, /checkout/success, /order/*, /cart, /track and /api — all
// non-indexable (and noindex at the metadata layer). Blog and concern routes
// don't exist yet (Phase 2, features 16/19); they join the sitemap when those
// features ship. Bundles is a single page for now.
//
// All URLs are absolute, built from NEXT_PUBLIC_SITE_URL (metadataBase origin).

const STATIC_PATHS = [
  { path: "/", priority: 1 },
  { path: "/shop", priority: 0.9 },
  { path: "/bundles", priority: 0.7 },
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

  return [...staticEntries, ...productEntries];
}
