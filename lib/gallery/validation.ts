import { z } from "zod";

import { GALLERY_CATEGORIES } from "./types";

/**
 * Validation for gallery image writes (feature 21).
 *
 * The admin form is a client component, but every write re-validates here at the
 * server-action edge before touching the service-role client — the client shape
 * is never trusted. `alt` is required and non-empty: the public grid renders
 * descriptive alt on every image (accessibility), so a blank one is rejected.
 */
export const galleryImageSchema = z.object({
  url: z.url("A valid image URL is required."),
  alt: z
    .string()
    .trim()
    .min(1, "Alt text is required — describe the image for screen readers.")
    .max(300, "Alt text is too long."),
  category: z.enum(GALLERY_CATEGORIES),
});

export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

/** A reorder request: the full set of image ids in their new display order. */
export const reorderSchema = z.object({
  orderedIds: z.array(z.uuid()).min(1, "Nothing to reorder."),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
