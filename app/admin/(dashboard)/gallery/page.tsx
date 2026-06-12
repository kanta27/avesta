import { requireAdmin } from "@/lib/auth/require-admin";
import { listGalleryImages } from "@/lib/gallery/admin";
import { GALLERY_CATEGORIES, categoryLabel } from "@/lib/gallery/types";
import { GalleryManager } from "@/components/admin/GalleryManager";

/** Gallery admin module (feature 21): upload, categorize, reorder, delete. */
export default async function AdminGalleryPage() {
  await requireAdmin();
  const images = await listGalleryImages();

  const counts = GALLERY_CATEGORIES.map((c) => ({
    category: c,
    count: images.filter((img) => img.category === c).length,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gallery</h1>
      </div>
      <p className="mb-6 text-sm text-grey">
        {images.length} image{images.length === 1 ? "" : "s"}
        {images.length > 0
          ? ` · ${counts
              .filter((c) => c.count > 0)
              .map((c) => `${c.count} ${categoryLabel(c.category)}`)
              .join(", ")}`
          : ""}
        . These appear on the public{" "}
        <a className="text-ink-2 underline" href="/gallery" target="_blank" rel="noreferrer">
          /gallery
        </a>{" "}
        page in this order.
      </p>

      <GalleryManager initial={images} />
    </div>
  );
}
