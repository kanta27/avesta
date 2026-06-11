// Slug helpers (feature 16). Pure — no DB. The uniqueness loop that consults
// the DB lives in `lib/blog/admin.ts` (`ensureUniqueSlug`), built on top of
// `slugify` here.

/**
 * Turn arbitrary text (a post title) into a URL-safe kebab-case slug:
 * lowercased, accents stripped, non-alphanumerics collapsed to single hyphens,
 * trimmed of leading/trailing hyphens. Falls back to "post" if nothing usable
 * remains, so the result is never empty.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, ""); // re-trim if the slice landed on a hyphen
  return slug || "post";
}
