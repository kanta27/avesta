// Blog domain types (feature 16). Pure / client-safe — no DB client here.
// These narrow the loosely-typed `blog_posts` row (jsonb `cover_image`,
// nullable text `status`/`source`) into the shapes the app actually uses.

/** Workflow states, in transition order. Matches the A2 CHECK constraint. */
export type BlogStatus = "draft" | "review" | "published";

/** Where a post originated. Matches the A2 CHECK constraint. */
export type BlogSource = "manual" | "automation";

export const BLOG_STATUSES: readonly BlogStatus[] = [
  "draft",
  "review",
  "published",
] as const;

export const BLOG_SOURCES: readonly BlogSource[] = [
  "manual",
  "automation",
] as const;

/** Narrowed shape of the `cover_image` jsonb column. */
export interface CoverImage {
  url: string;
  alt?: string;
}

/** A published post as shown in the public index (no body). */
export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: CoverImage | null;
  tags: string[];
  publishedAt: string | null;
}

/** A published post as shown on its public detail page. */
export interface BlogPostDetail extends BlogPostListItem {
  bodyMd: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

/** A row for the admin list table — any status/source. */
export interface AdminBlogListItem {
  id: string;
  slug: string;
  title: string;
  status: BlogStatus;
  source: BlogSource;
  publishedAt: string | null;
  createdAt: string | null;
}

/** A post loaded into the admin editor (all editable fields + id/status/source). */
export interface AdminBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  bodyMd: string | null;
  cover: CoverImage | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  status: BlogStatus;
  source: BlogSource;
  publishedAt: string | null;
}

/** Coerce the nullable text `status` column into a known status (default draft). */
export function toBlogStatus(value: string | null): BlogStatus {
  return value === "review" || value === "published" ? value : "draft";
}

/** Coerce the nullable text `source` column into a known source (default manual). */
export function toBlogSource(value: string | null): BlogSource {
  return value === "automation" ? "automation" : "manual";
}

/** Narrow the `cover_image` jsonb into a CoverImage, or null if shapeless. */
export function toCoverImage(value: unknown): CoverImage | null {
  if (value && typeof value === "object" && "url" in value) {
    const url = (value as { url?: unknown }).url;
    const alt = (value as { alt?: unknown }).alt;
    if (typeof url === "string" && url.length > 0) {
      return { url, alt: typeof alt === "string" ? alt : undefined };
    }
  }
  return null;
}
