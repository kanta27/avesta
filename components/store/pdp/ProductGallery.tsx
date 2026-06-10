"use client";

import { useState } from "react";
import { PRODUCT_PLACEHOLDER } from "@/lib/products/placeholder";
import type { ProductDetail } from "@/lib/products/types";

/**
 * Product image gallery: a large active image with thumbnail switching. When a
 * product has no images yet (current placeholder catalog), it falls back to the
 * type emoji over the demo gradient — the same placeholder the Shop card uses.
 */
export function ProductGallery({ product }: { product: ProductDetail }) {
  const { images, type, name } = product;
  const placeholder = PRODUCT_PLACEHOLDER[type];
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="pdp-gallery">
        <div
          className="pdp-stage pdp-stage--placeholder"
          style={{ background: placeholder.background }}
        >
          <span aria-hidden>{placeholder.emoji}</span>
        </div>
      </div>
    );
  }

  const current = images[active] ?? images[0];

  return (
    <div className="pdp-gallery">
      <div className="pdp-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt ?? name} />
      </div>
      {images.length > 1 ? (
        <div className="pdp-thumbs" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              type="button"
              key={img.url}
              role="tab"
              aria-selected={i === active}
              aria-label={img.alt ?? `${name} image ${i + 1}`}
              className={`pdp-thumb${i === active ? " on" : ""}`}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
