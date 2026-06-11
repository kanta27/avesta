"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createImageUploadTarget,
  createProduct,
  setProductActive,
  updateProduct,
  type ImageUploadTarget,
} from "@/lib/products/admin";
import { productInputSchema } from "@/lib/products/validation";

/**
 * Products server actions (feature 12).
 *
 * ARCHITECTURE RULE: every export here calls `requireAdmin()` FIRST, then writes
 * via the service-role data layer. The form is a client component, but the write
 * path is only ever these server actions — the service-role client is never
 * imported into client code.
 */

export type SaveProductResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

/** Refresh the admin list AND the public storefront (catalog + PDP) after a write. */
function revalidateProductSurfaces(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/"); // homepage catalog
  revalidatePath("/products");
  if (slug) revalidatePath(`/products/${slug}`);
}

/**
 * Create or update a product. `id === null` creates; otherwise updates that id.
 * Returns a typed result so the form can show field errors instead of throwing.
 */
export async function saveProductAction(
  id: string | null,
  raw: unknown,
): Promise<SaveProductResult> {
  await requireAdmin();

  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    if (id) {
      await updateProduct(id, parsed.data);
      revalidateProductSurfaces(parsed.data.slug);
      return { ok: true, id };
    }
    const created = await createProduct(parsed.data);
    revalidateProductSurfaces(parsed.data.slug);
    return { ok: true, id: created.id };
  } catch (err: unknown) {
    // Unique-violation on slug is the common, user-fixable case.
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return { ok: false, error: "That slug is already in use — choose another." };
    }
    const message = err instanceof Error ? err.message : "Could not save product.";
    return { ok: false, error: message };
  }
}

/** Toggle a product's storefront visibility (`is_active`). */
export async function setProductActiveAction(
  id: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await setProductActive(id, isActive);
    revalidateProductSurfaces();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update product.";
    return { ok: false, error: message };
  }
}

export type UploadUrlResult =
  | { ok: true; target: ImageUploadTarget }
  | { ok: false; error: string };

/**
 * Mint a one-time signed upload URL for a product image. The browser uploads
 * directly to it with the anon client — the service-role key stays on the server.
 */
export async function createImageUploadUrlAction(
  slug: string,
  ext: string,
): Promise<UploadUrlResult> {
  await requireAdmin();
  try {
    const target = await createImageUploadTarget(slug, ext);
    return { ok: true, target };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start upload.";
    return { ok: false, error: message };
  }
}
