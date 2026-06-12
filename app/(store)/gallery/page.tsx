import type { Metadata } from "next";
import Link from "next/link";

import { SectionHead } from "@/components/ui/SectionHead";
import { getGalleryImages } from "@/lib/gallery/queries";
import {
  GALLERY_CATEGORIES,
  categoryLabel,
  isGalleryCategory,
  type GalleryCategory,
} from "@/lib/gallery/types";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A look inside Avesta Nordic — our products, our lab, and how we manufacture our hydration drinks and nutrient gummies.",
  alternates: { canonical: "/gallery" },
};

// Gallery changes when an admin uploads/reorders; let Next revalidate so updates
// surface without a redeploy (the admin actions also revalidate this path).
export const revalidate = 300;

type SearchParams = Promise<{ category?: string }>;

function asCategory(v: string | undefined): GalleryCategory | undefined {
  return v && isGalleryCategory(v) ? v : undefined;
}

const pill =
  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors";
const pillOn = "border-ink bg-ink text-white";
const pillOff = "border-line bg-white text-grey hover:border-ink hover:text-ink";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const active = asCategory(sp.category);

  const all = await getGalleryImages();
  const images = active ? all.filter((img) => img.category === active) : all;

  // Only offer filter pills for categories that actually have images, so the
  // filters never lead to an empty result the user didn't ask for.
  const present = GALLERY_CATEGORIES.filter((c) =>
    all.some((img) => img.category === c),
  );

  return (
    <section id="gallery">
      <div className="wrap">
        <SectionHead
          kicker="Gallery"
          title="Inside Avesta Nordic"
          description="Our products, our lab, and how we make them — a visual tour of the brand."
        />

        {all.length === 0 ? (
          <p className="shop-empty">
            Our gallery is coming soon — we&apos;re putting the finishing touches
            on it. Check back shortly.
          </p>
        ) : (
          <>
            {present.length > 0 && (
              <div className="mb-7 flex flex-wrap items-center gap-2">
                <Link
                  href="/gallery"
                  className={`${pill} ${!active ? pillOn : pillOff}`}
                >
                  All
                </Link>
                {present.map((c) => (
                  <Link
                    key={c}
                    href={`/gallery?category=${c}`}
                    className={`${pill} ${active === c ? pillOn : pillOff}`}
                  >
                    {categoryLabel(c)}
                  </Link>
                ))}
              </div>
            )}

            {images.length === 0 ? (
              <p className="shop-empty">
                No images in this category yet.{" "}
                <Link href="/gallery">View all</Link>.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {images.map((img) => (
                  <figure
                    key={img.id}
                    className="overflow-hidden rounded-card border border-line bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                    <figcaption className="px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-grey">
                      {categoryLabel(img.category)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
