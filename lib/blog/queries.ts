import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase";
import {
  toCoverImage,
  type BlogPostDetail,
  type BlogPostListItem,
} from "./types";

/**
 * Public blog read path (feature 16).
 *
 * Reads via the server-side anon client, so the `blog_posts_public_read` RLS
 * policy applies: only `status = 'published'` rows are EVER returned. The
 * `.eq("status", "published")` predicates below are belt-and-suspenders, not the
 * guarantee — a draft/review post is invisible to the public regardless.
 *
 * Admin (all statuses, full write) is a separate module: `lib/blog/admin.ts`.
 */

type BlogRow = Tables<"blog_posts">;

function toListItem(row: BlogRow): BlogPostListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover: toCoverImage(row.cover_image),
    tags: row.tags ?? [],
    publishedAt: row.published_at,
  };
}

/** Published posts, newest published first. Empty array when none exist. */
export async function getPublishedPosts(): Promise<BlogPostListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image, tags, published_at, status")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load blog posts: ${error.message}`);
  }

  return (data ?? []).map((row) => toListItem(row as BlogRow));
}

/**
 * One published post by slug, or `null` if no published row matches (unknown
 * slug, or a draft/review post the public can't see). The page turns `null`
 * into a 404.
 */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<BlogPostDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, body_md, cover_image, tags, seo_title, seo_description, published_at, status",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load blog post "${slug}": ${error.message}`);
  }
  if (!data) return null;

  const row = data as BlogRow;
  return {
    ...toListItem(row),
    bodyMd: row.body_md,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

/** Slugs of all published posts — for the sitemap. */
export async function getPublishedSlugs(): Promise<
  { slug: string; publishedAt: string | null }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, published_at, status")
    .eq("status", "published");

  if (error) {
    throw new Error(`Failed to load blog slugs: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    slug: row.slug,
    publishedAt: row.published_at,
  }));
}
