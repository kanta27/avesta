import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/lib/supabase";
import {
  toConcernFaqs,
  type AdminConcernListItem,
  type ConcernPage,
} from "./types";
import type { ConcernPageInput } from "./validation";

/**
 * Admin data layer for concern landing pages (feature 19). Service-role —
 * BYPASSES RLS, so it reads and writes every row. `server-only` keeps it off the
 * client. The single caller (the admin server actions) gates on `requireAdmin()`
 * first. Separate from `lib/concerns/queries.ts`, the public anon-client read.
 */

/** All concern pages, newest first, shaped for the admin list table. */
export async function listAllConcernPages(): Promise<AdminConcernListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("concern_pages")
    .select("id, slug, concern, h1, product_ids, faqs")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list concern pages: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    concern: row.concern,
    h1: row.h1,
    productCount: (row.product_ids ?? []).length,
    faqCount: toConcernFaqs(row.faqs).length,
  }));
}

/** Load one concern page for the admin editor, or `null` if not found. */
export async function getConcernPageForEdit(
  id: string,
): Promise<ConcernPage | null> {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("concern_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load concern page: ${error.message}`);
  if (!row) return null;

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

/**
 * Return a slug unique within `concern_pages`. Starts from `base` (an
 * already-validated slug) and appends `-2`, `-3`, … until free. `exceptId` lets
 * an edit keep its own slug without colliding with itself. The slug is the
 * `/health-concern/[slug]` URL, so a clash must not 500 the action.
 */
async function ensureUniqueSlug(
  base: string,
  exceptId?: string,
): Promise<string> {
  const admin = createAdminClient();

  for (let n = 1; n < 1000; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    let query = admin
      .from("concern_pages")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (exceptId) query = query.neq("id", exceptId);

    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Failed to check slug: ${error.message}`);
    if (!data) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Map validated input to a DB row payload (jsonb columns as-is). */
function toRow(input: ConcernPageInput, slug: string): TablesInsert<"concern_pages"> {
  return {
    slug,
    concern: input.concern,
    h1: input.h1,
    intro_md: input.intro_md,
    faqs: input.faqs,
    product_ids: input.product_ids,
    seo_title: input.seo_title,
    seo_description: input.seo_description,
  };
}

/** Insert a new concern page. Returns its id + final slug. */
export async function createConcernPage(
  input: ConcernPageInput,
): Promise<{ id: string; slug: string }> {
  const admin = createAdminClient();
  const slug = await ensureUniqueSlug(input.slug);

  const { data, error } = await admin
    .from("concern_pages")
    .insert(toRow(input, slug))
    .select("id, slug")
    .single();
  if (error) throw error;
  return { id: data.id, slug: data.slug };
}

/** Update an existing concern page in place. Returns its final slug. */
export async function updateConcernPage(
  id: string,
  input: ConcernPageInput,
): Promise<{ slug: string }> {
  const admin = createAdminClient();
  const slug = await ensureUniqueSlug(input.slug, id);

  const { error } = await admin
    .from("concern_pages")
    .update(toRow(input, slug))
    .eq("id", id);
  if (error) throw error;
  return { slug };
}
