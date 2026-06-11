import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/lib/supabase";
import { slugify } from "./slug";
import {
  toBlogSource,
  toBlogStatus,
  toCoverImage,
  type AdminBlogListItem,
  type AdminBlogPost,
  type BlogSource,
  type BlogStatus,
} from "./types";
import type { AdminPostInput, AutomationPayload } from "./validation";

/**
 * Admin blog data layer (feature 16). Service-role — BYPASSES RLS, so it reads
 * every status/source and writes posts. `server-only` keeps it off the client.
 * Every caller (the admin server actions + the automation route) is responsible
 * for its own gate first: `requireAdmin()` for the admin actions, the bearer
 * token for the automation route.
 *
 * Deliberately separate from `lib/blog/queries.ts`, the PUBLIC read path, which
 * uses the anon client under RLS and only ever sees published rows.
 */

/** Filters for the admin list. Omit a field to not filter on it. */
export interface AdminListFilters {
  status?: BlogStatus;
  source?: BlogSource;
}

/** All posts (any status/source), newest first, optionally filtered. */
export async function listAllPosts(
  filters: AdminListFilters = {},
): Promise<AdminBlogListItem[]> {
  const admin = createAdminClient();
  let query = admin
    .from("blog_posts")
    .select("id, slug, title, status, source, published_at, created_at")
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.source) query = query.eq("source", filters.source);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list blog posts: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: toBlogStatus(row.status),
    source: toBlogSource(row.source),
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }));
}

/** Load one post (any status) for the admin editor, or `null` if not found. */
export async function getPostForEdit(
  id: string,
): Promise<AdminBlogPost | null> {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load blog post: ${error.message}`);
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    bodyMd: row.body_md,
    cover: toCoverImage(row.cover_image),
    tags: row.tags ?? [],
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    status: toBlogStatus(row.status),
    source: toBlogSource(row.source),
    publishedAt: row.published_at,
  };
}

/**
 * Return a slug unique within `blog_posts`. Starts from `base` (already
 * slugified) and appends `-2`, `-3`, … until free. `exceptId` lets an edit keep
 * its own slug without colliding with itself.
 */
export async function ensureUniqueSlug(
  base: string,
  exceptId?: string,
): Promise<string> {
  const admin = createAdminClient();
  const root = slugify(base);

  for (let n = 1; n < 1000; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    let query = admin
      .from("blog_posts")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (exceptId) query = query.neq("id", exceptId);

    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Failed to check slug: ${error.message}`);
    if (!data) return candidate;
  }
  // Astronomically unlikely; keep the type honest with a unique-ish fallback.
  return `${root}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Whether moving from one status to another should stamp published_at now. */
function publishedAtFor(
  next: BlogStatus,
  current: { status: BlogStatus; publishedAt: string | null },
): string | null | undefined {
  // Stamp on the FIRST transition to published; preserve an existing stamp.
  if (next === "published") {
    return current.publishedAt ?? new Date().toISOString();
  }
  // Leave published_at untouched when not publishing (return undefined = no-op).
  return undefined;
}

/**
 * Create a post from validated ADMIN input. The admin supplies the slug; we
 * still pass it through `ensureUniqueSlug` so a clash can't 500 the action.
 * `published_at` is stamped iff the admin creates it already-published.
 */
export async function createPost(
  input: AdminPostInput,
): Promise<{ id: string; slug: string }> {
  const admin = createAdminClient();
  const slug = await ensureUniqueSlug(input.slug);

  const row: TablesInsert<"blog_posts"> = {
    slug,
    title: input.title,
    excerpt: input.excerpt,
    body_md: input.body_md,
    cover_image: input.cover_image,
    tags: input.tags,
    seo_title: input.seo_title,
    seo_description: input.seo_description,
    status: input.status,
    source: "manual",
    published_at: input.status === "published" ? new Date().toISOString() : null,
  };

  const { data, error } = await admin
    .from("blog_posts")
    .insert(row)
    .select("id, slug")
    .single();
  if (error) throw error;
  return { id: data.id, slug: data.slug };
}

/**
 * Update a post from validated ADMIN input (content + status together). Honors
 * the publish stamp rule. The slug is re-uniqued against everyone but this row.
 */
export async function updatePost(
  id: string,
  input: AdminPostInput,
): Promise<{ slug: string }> {
  const admin = createAdminClient();

  const { data: existing, error: loadError } = await admin
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .single();
  if (loadError) throw loadError;

  const slug = await ensureUniqueSlug(input.slug, id);
  const stamp = publishedAtFor(input.status, {
    status: toBlogStatus(existing.status),
    publishedAt: existing.published_at,
  });

  const { error } = await admin
    .from("blog_posts")
    .update({
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body_md: input.body_md,
      cover_image: input.cover_image,
      tags: input.tags,
      seo_title: input.seo_title,
      seo_description: input.seo_description,
      status: input.status,
      // Only write published_at when the rule says to (undefined = leave as-is).
      ...(stamp !== undefined ? { published_at: stamp } : {}),
    })
    .eq("id", id);
  if (error) throw error;
  return { slug };
}

/**
 * Transition a post's status only (the list-row publish/unpublish controls).
 * Stamps published_at on the first move to published; leaves it otherwise.
 */
export async function transitionStatus(
  id: string,
  next: BlogStatus,
): Promise<void> {
  const admin = createAdminClient();

  const { data: existing, error: loadError } = await admin
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .single();
  if (loadError) throw loadError;

  const stamp = publishedAtFor(next, {
    status: toBlogStatus(existing.status),
    publishedAt: existing.published_at,
  });

  const { error } = await admin
    .from("blog_posts")
    .update({
      status: next,
      ...(stamp !== undefined ? { published_at: stamp } : {}),
    })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Insert an AUTOMATION draft (feature 16 guardrail). status='review' and
 * source='automation' are HARDCODED here — the caller's payload has no status
 * field and cannot influence either. NEVER auto-published; a human admin makes
 * the publish transition. The slug is generated from the title.
 */
export async function createAutomationDraft(
  payload: AutomationPayload,
): Promise<{ id: string; slug: string }> {
  const admin = createAdminClient();
  const slug = await ensureUniqueSlug(payload.title);

  const row: TablesInsert<"blog_posts"> = {
    slug,
    title: payload.title,
    excerpt: payload.excerpt,
    body_md: payload.body_md,
    cover_image: payload.cover_image,
    tags: payload.tags,
    seo_title: payload.seo_title,
    seo_description: payload.seo_description,
    status: "review", // HARDCODED — never trust the request body.
    source: "automation", // HARDCODED.
    published_at: null,
  };

  const { data, error } = await admin
    .from("blog_posts")
    .insert(row)
    .select("id, slug")
    .single();
  if (error) throw error;
  return { id: data.id, slug: data.slug };
}
