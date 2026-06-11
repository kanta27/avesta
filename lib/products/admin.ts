import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/lib/supabase";
import type {
  Bioactive,
  Faq,
  Ingredient,
  PackTier,
} from "./types";
import type { ProductInput } from "./validation";

/**
 * Admin product data layer (feature 12). Service-role — BYPASSES RLS, so it can
 * read inactive products and write the catalog. `server-only` keeps it off the
 * client. Every caller (the server actions) gates on `requireAdmin()` first.
 *
 * This is deliberately separate from `lib/products/queries.ts`, which is the
 * PUBLIC read path: that one uses the anon client under RLS and only ever sees
 * `is_active` rows. Admin needs the opposite (all rows, full write), so it gets
 * its own module rather than loosening the public one.
 */

/** Coerce a jsonb array column into a typed array, tolerating null / non-array. */
function jsonArray<T>(value: unknown): T[] {
  return (Array.isArray(value) ? value : []) as T[];
}

/** A product row shaped for the admin list table. */
export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  stockCount: number;
  /** Lowest pack-tier price in paise, for an at-a-glance "from" figure. */
  fromPaise: number | null;
  imageCount: number;
}

/** All products, active and inactive — newest first. */
export async function listAllProducts(): Promise<AdminProductListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("id, name, slug, type, is_active, stock_count, pack_tiers, images")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list products: ${error.message}`);

  return (data ?? []).map((row) => {
    const tiers = jsonArray<PackTier>(row.pack_tiers);
    const prices = tiers
      .map((t) => t.price_paise)
      .filter((p): p is number => typeof p === "number");
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.type,
      isActive: row.is_active ?? false,
      stockCount: row.stock_count ?? 0,
      fromPaise: prices.length ? Math.min(...prices) : null,
      imageCount: jsonArray<unknown>(row.images).length,
    };
  });
}

/** A product loaded for the edit form: the validated input shape plus its id. */
export interface AdminProductForEdit extends ProductInput {
  id: string;
}

/** Load one product (any active state) and narrow it into the form's shape. */
export async function getProductForEdit(
  id: string,
): Promise<AdminProductForEdit | null> {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type === "gummy" ? "gummy" : "hydration",
    tagline: row.tagline,
    description: row.description,
    concerns: row.concerns ?? [],
    pack_tiers: jsonArray<PackTier>(row.pack_tiers),
    ingredients: jsonArray<Ingredient>(row.ingredients),
    bioactives: jsonArray<Bioactive>(row.bioactives),
    science_html: row.science_html,
    faqs: jsonArray<Faq>(row.faqs),
    who_for: row.who_for,
    who_not_for: row.who_not_for,
    badges: jsonArray<string>(row.badges),
    images: jsonArray<{ url: string; alt?: string }>(row.images),
    stock_count: row.stock_count ?? 0,
    is_active: row.is_active ?? true,
  };
}

/** Map the validated input to a DB row payload (jsonb columns as-is). */
function toRow(input: ProductInput): TablesInsert<"products"> {
  return {
    name: input.name,
    slug: input.slug,
    type: input.type,
    tagline: input.tagline ?? null,
    description: input.description ?? null,
    concerns: input.concerns,
    pack_tiers: input.pack_tiers,
    ingredients: input.ingredients,
    bioactives: input.bioactives,
    science_html: input.science_html ?? null,
    faqs: input.faqs,
    who_for: input.who_for ?? null,
    who_not_for: input.who_not_for ?? null,
    badges: input.badges,
    images: input.images,
    stock_count: input.stock_count,
    is_active: input.is_active,
  };
}

/** Insert a new product. Returns its id. */
export async function createProduct(
  input: ProductInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .insert(toRow(input))
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

/** Update an existing product in place. */
export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("products").update(toRow(input)).eq("id", id);
  if (error) throw error;
}

/** Flip a product's `is_active` flag (show/hide from the storefront). */
export async function setProductActive(
  id: string,
  isActive: boolean,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw error;
}

/** A signed upload target for a product image. */
export interface ImageUploadTarget {
  /** Object path within the `products` bucket. */
  path: string;
  /** One-time signed token the browser uses with `uploadToSignedUrl`. */
  token: string;
  /** Public URL the image will be served from once uploaded. */
  publicUrl: string;
}

/**
 * Mint a one-time signed upload URL for the `products` storage bucket.
 *
 * The browser uploads directly to this signed target with the ANON client
 * (`uploadToSignedUrl`) — the service-role key never leaves the server. This is
 * the A3 storage model: public-read buckets, writes only via server-issued
 * signed URLs. `pathPrefix` is a sanitized slug used only to organize objects.
 */
export async function createImageUploadTarget(
  pathPrefix: string,
  ext: string,
): Promise<ImageUploadTarget> {
  const admin = createAdminClient();
  const safePrefix =
    pathPrefix.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "product";
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const path = `${safePrefix}/${crypto.randomUUID()}.${safeExt}`;

  const { data, error } = await admin.storage
    .from("products")
    .createSignedUploadUrl(path);
  if (error) throw error;

  const { data: pub } = admin.storage.from("products").getPublicUrl(path);

  return { path: data.path, token: data.token, publicUrl: pub.publicUrl };
}
