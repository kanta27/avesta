import type { MetadataRoute } from "next";

import { publicEnv } from "@/lib/env";

// Allow public crawling; disallow the private / non-indexable areas (these also
// carry noindex metadata as defence-in-depth). Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  const origin = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/order", "/cart", "/track", "/api"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
