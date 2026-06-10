import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { PRODUCT_PLACEHOLDER } from "@/lib/products/placeholder";
import { CONCERN_OPTIONS } from "@/lib/products/types";
import { formatPaiseINR } from "@/lib/format";
import type { BundleListItem } from "@/lib/bundles/types";

/** Human-friendly label for a concern key (e.g. "hair-skin" → "Hair & Skin"). */
function concernLabel(concern: string): string {
  return CONCERN_OPTIONS.find((c) => c.key === concern)?.label ?? concern;
}

/**
 * A concern-based bundle card: the concern framing, the member products (each
 * linking to its `/shop/[slug]` page with its individual reference price), the
 * bundle price with a strike-through sum-of-parts and the saving.
 *
 * Server component — no interactive state. "Add bundle to cart" is a layout-only
 * PLACEHOLDER mirroring the PDP: it carries the `data-cart-ref` the cart feature
 * (feature 4) will consume `{ bundleId, qty }` and re-price from the DB; there is
 * no handler yet.
 */
export function BundleCard({ bundle }: { bundle: BundleListItem }) {
  // The cart payload feature 4 will send — a bundle ref only, never a price.
  const cartRef = { bundleId: bundle.id, qty: 1 };

  return (
    <article className="bundle" aria-labelledby={`bundle-${bundle.id}`}>
      <div className="bundle-body">
        {bundle.concern ? (
          <span className="bundle-concern mono">
            {concernLabel(bundle.concern)}
          </span>
        ) : null}
        <h3 id={`bundle-${bundle.id}`} className="bundle-name">
          {bundle.name}
        </h3>

        <ul className="bundle-members">
          {bundle.members.map((m) => {
            const placeholder = PRODUCT_PLACEHOLDER[m.type];
            return (
              <li key={m.id} className="bundle-member">
                <span
                  className="bundle-member-thumb"
                  style={{ background: placeholder.background }}
                  aria-hidden
                >
                  {placeholder.emoji}
                </span>
                <Link
                  href={`/shop/${m.slug}`}
                  className="bundle-member-name"
                >
                  {m.name}
                </Link>
                {m.referencePaise != null ? (
                  <span className="bundle-member-price">
                    {formatPaiseINR(m.referencePaise)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="bundle-price-row">
          <span className="price">{formatPaiseINR(bundle.pricePaise)}</span>
          {bundle.compareAtPaise != null &&
          bundle.savingPaise != null ? (
            <span className="bundle-compare">
              <s aria-label="Buying separately">
                {formatPaiseINR(bundle.compareAtPaise)}
              </s>
            </span>
          ) : null}
        </div>

        {bundle.savingPaise != null ? (
          <p className="bundle-save mono">
            Save {formatPaiseINR(bundle.savingPaise)}
            {bundle.savingPct != null ? ` · ${bundle.savingPct}%` : ""} vs buying
            separately
          </p>
        ) : null}

        <Button
          variant="lime"
          className="add"
          // Placeholder — feature 4 reads this ref to add the bundle to cart.
          data-cart-ref={JSON.stringify(cartRef)}
        >
          Add bundle to cart
        </Button>
      </div>
    </article>
  );
}
