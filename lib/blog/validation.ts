import { z } from "zod";

import { BLOG_STATUSES } from "./types";

/**
 * Shared validation for blog post input (feature 16).
 *
 * Two consumers:
 *   - the admin editor (server actions) — trusts the admin, allows any status;
 *   - the automation endpoint — UNTRUSTED. It validates the *content* fields
 *     with `automationPayloadSchema` (which has NO status field at all) and the
 *     route HARDCODES status='review' / source='automation'. The agent can
 *     never choose its own status.
 *
 * `body_md` is treated as untrusted text everywhere; it is rendered through the
 * allowlist sanitizer (`components/blog/Markdown.tsx`), never as raw HTML.
 */

const coverImageSchema = z
  .object({
    url: z.string().trim().url("Cover image must be a valid URL."),
    alt: z.string().trim().max(300).optional(),
  })
  .nullable();

/** Tags: trimmed, de-duplicated, empties dropped, capped. */
const tagsSchema = z.preprocess(
  (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") return v.split(",");
    return [];
  },
  z
    .array(z.string().trim().min(1).max(40))
    .max(20)
    .transform((arr) => [...new Set(arr)]),
);

const nullableText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().trim().max(max).nullable(),
  );

/**
 * The content fields shared by both the admin editor and the automation
 * endpoint. Note: NO `status` and NO `source` here — those are decided by the
 * server, never by the caller's body.
 */
const blogContentShape = {
  title: z.string().trim().min(1, "Title is required.").max(200),
  excerpt: nullableText(500),
  body_md: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().max(100_000).nullable(),
  ),
  cover_image: coverImageSchema.default(null),
  tags: tagsSchema.default([]),
  seo_title: nullableText(70),
  seo_description: nullableText(200),
};

/**
 * Automation payload — exactly the spec's body
 * `{ title, body_md, excerpt, tags, seo_title, seo_description, cover_image }`.
 * `.strip()` (the zod default) drops any extra keys, so a `status` or `source`
 * smuggled into the body is silently discarded rather than honored.
 */
export const automationPayloadSchema = z.object(blogContentShape);
export type AutomationPayload = z.infer<typeof automationPayloadSchema>;

/**
 * Admin editor input — the content fields plus an explicit `slug` (the admin
 * controls the URL) and a `status` the admin may set directly.
 */
export const adminPostSchema = z.object({
  ...blogContentShape,
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase words separated by single hyphens.",
    ),
  status: z.enum(BLOG_STATUSES),
});
export type AdminPostInput = z.infer<typeof adminPostSchema>;
