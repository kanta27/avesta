// Admin product authoring validation — pure (zod only), no DB access.
//
// This is the server-side trust boundary for the Products CMS (feature 12). The
// admin form is a client component, so everything it sends is re-validated here
// before the service-role client writes it. Unlike checkout (which must NEVER
// trust client prices), the admin IS the price authority — there is no upstream
// to re-price against — so we validate shape/bounds, not provenance.
//
// Money is integer paise throughout (conventions.md). The form collects rupees
// and converts to paise before submit; the schemas below enforce non-negative
// integers so a stray float can't slip in.

import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    trimmed(max).nullable().optional(),
  );

/** A single pack tier (`products.pack_tiers`). Money in paise. */
export const packTierSchema = z.object({
  key: trimmed(20).min(1, "Pack key is required."),
  label: trimmed(60).min(1, "Pack label is required."),
  units: z.number().int().min(0).max(100000),
  price_paise: z.number().int().min(0).max(100000000),
  discount_pct: z.number().min(0).max(100),
  per_day_paise: z.number().int().min(0).max(100000000),
  is_default: z.boolean(),
});

/** One ingredient row (`products.ingredients`). */
export const ingredientSchema = z.object({
  name: trimmed(120).min(1, "Ingredient name is required."),
  amount: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.union([z.string().trim().max(40), z.number()]).optional(),
  ),
  unit: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    trimmed(20).optional(),
  ),
});

/** One bioactive row (`products.bioactives`). */
export const bioactiveSchema = z.object({
  name: trimmed(120).min(1, "Bioactive name is required."),
  role: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    trimmed(200).optional(),
  ),
  evidence_url: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.url("Evidence link must be a valid URL.").max(500).optional(),
  ),
});

/** One FAQ row (`products.faqs`). */
export const faqSchema = z.object({
  q: trimmed(300).min(1, "Question is required."),
  a: trimmed(2000).min(1, "Answer is required."),
});

/** One image (`products.images`). `url` is already an uploaded public URL. */
export const productImageSchema = z.object({
  url: z.url("Image URL is invalid.").max(1000),
  alt: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    trimmed(200).optional(),
  ),
});

/** Slug: lowercase kebab-case, the storefront route key. Must stay URL-safe. */
const slugSchema = trimmed(80)
  .min(1, "Slug is required.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers and single hyphens.",
  );

/**
 * The full admin product payload. Unknown keys are stripped. `rating_avg` /
 * `rating_source` are intentionally NOT here — they are review-derived display
 * values (reviews are Phase 2), not admin-authored, so the form never writes
 * them.
 */
export const productInputSchema = z.object({
  name: trimmed(160).min(1, "Name is required."),
  slug: slugSchema,
  type: z.enum(["hydration", "gummy"]),
  tagline: optionalText(300),
  description: optionalText(5000),
  concerns: z.array(trimmed(40).min(1)).max(20).default([]),
  pack_tiers: z
    .array(packTierSchema)
    .min(1, "Add at least one pack tier.")
    .max(10),
  ingredients: z.array(ingredientSchema).max(100).default([]),
  bioactives: z.array(bioactiveSchema).max(100).default([]),
  science_html: optionalText(20000),
  faqs: z.array(faqSchema).max(100).default([]),
  who_for: optionalText(2000),
  who_not_for: optionalText(2000),
  badges: z.array(trimmed(60).min(1)).max(20).default([]),
  images: z.array(productImageSchema).max(20).default([]),
  stock_count: z.number().int().min(0).max(1000000),
  is_active: z.boolean(),
});

/** Parsed, normalized admin product payload (paise money, nulls for blanks). */
export type ProductInput = z.infer<typeof productInputSchema>;
