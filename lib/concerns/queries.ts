import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase";
import { toConcernFaqs, type ConcernPage } from "./types";

/**
 * PUBLIC read path for concern landing pages (feature 19).
 *
 * Uses the server-side anon client, so the `concern_pages_public_read` RLS
 * policy applies. `concern_pages` has no status column — every row is public the
 * moment it exists — so the policy is `using (true)` and there is no
 * draft/publish gate to mirror here.
 *
 * Deliberately separate from `lib/concerns/admin.ts`, the service-role write
 * path.
 */

type ConcernPageRow = Tables<"concern_pages">;

function toConcernPage(row: ConcernPageRow): ConcernPage {
  return {
    id: row.id,
    slug: row.slug,
    concern: row.concern,
    h1: row.h1,
    introMd: row.intro_md,
    faqs: toConcernFaqs(row.faqs),
    productIds: row.product_ids ?? [],
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

/** Load one concern page by slug, or `null` if no row matches (→ 404). */
export async function getConcernPageBySlug(
  slug: string,
): Promise<ConcernPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concern_pages")
    .select(
      "id, slug, concern, h1, intro_md, faqs, product_ids, seo_title, seo_description",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load concern page "${slug}": ${error.message}`);
  }

  return data ? toConcernPage(data as ConcernPageRow) : null;
}

/** Every concern-page slug — for the sitemap (feature 14 hook) and the homepage
 *  ConcernGrid link resolution. */
export async function getAllConcernSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("concern_pages").select("slug");

  if (error) {
    throw new Error(`Failed to load concern slugs: ${error.message}`);
  }

  return (data ?? []).map((row) => row.slug);
}
