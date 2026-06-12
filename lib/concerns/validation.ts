import { z } from "zod";

/**
 * Validation for concern-page admin input (feature 19).
 *
 * The admin is trusted to author content, but everything is still validated for
 * shape (a clash/malformed payload must not 500 the action) and `intro_md` is
 * treated as UNTRUSTED text everywhere downstream — it renders only through the
 * allowlist sanitizer (`components/blog/Markdown.tsx`), never as raw HTML.
 *
 * There is NO status column on `concern_pages` — a page is live the moment it
 * exists, so there is deliberately no draft/publish field here.
 */

const nullableText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().trim().max(max).nullable(),
  );

/** FAQ rows: drop fully-empty rows, require both halves on the rest, cap count. */
const faqsSchema = z.preprocess(
  (v) => {
    if (!Array.isArray(v)) return [];
    return v.filter(
      (f) =>
        f &&
        typeof f === "object" &&
        (String((f as { q?: unknown }).q ?? "").trim() !== "" ||
          String((f as { a?: unknown }).a ?? "").trim() !== ""),
    );
  },
  z
    .array(
      z.object({
        q: z.string().trim().min(1, "FAQ question is required.").max(300),
        a: z.string().trim().min(1, "FAQ answer is required.").max(2000),
      }),
    )
    .max(30),
);

/** product_ids: keep only valid UUIDs, de-duplicate, cap. */
const productIdsSchema = z.preprocess(
  (v) => (Array.isArray(v) ? v : []),
  z
    .array(z.string().uuid())
    .max(50)
    .transform((arr) => [...new Set(arr)]),
);

export const concernPageSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase words separated by single hyphens.",
    ),
  concern: z.string().trim().min(1, "Concern label is required.").max(120),
  h1: nullableText(200),
  intro_md: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().max(50_000).nullable(),
  ),
  faqs: faqsSchema.default([]),
  product_ids: productIdsSchema.default([]),
  seo_title: nullableText(70),
  seo_description: nullableText(200),
});

export type ConcernPageInput = z.infer<typeof concernPageSchema>;
