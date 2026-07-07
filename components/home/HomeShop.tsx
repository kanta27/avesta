"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "./icons";
import { formatPaiseINR } from "@/lib/format";
import { useCart } from "@/lib/cart/store";
import { PRODUCT_PLACEHOLDER, starString } from "@/lib/products/placeholder";
import {
  CONCERN_OPTIONS,
  defaultTierIndex,
  type ProductListItem,
} from "@/lib/products/types";

/**
 * Reference shop section (filters → product grid → "see more"), hydrated from
 * the live Supabase catalog instead of the reference's mock PRODUCTS array.
 * Card/filter markup and interaction (pack select, expand, added-state) match
 * the reference; add-to-cart goes through the real cart store, which also
 * opens the drawer.
 */

/** Concern accent colors, reference palette mapped onto our concern keys. */
const CONCERN_COLOR: Record<string, string> = {
  hydration: "#2f7fb8",
  energy: "#b8487f",
  immunity: "#5aa72f",
  sleep: "#2f9e8f",
  "hair-skin": "#c2415c",
  "daily-nutrition": "#27a9e0",
};
const CONCERN_LABEL = new Map(CONCERN_OPTIONS.map((c) => [c.key, c.label]));

function colCount(): number {
  const w = window.innerWidth;
  return w > 980 ? 3 : w > 640 ? 2 : 1;
}

/** Pre-discount compare price for a tier, derived from its discount percent. */
function comparePaise(pricePaise: number, discountPct: number): number | null {
  if (discountPct <= 0) return null;
  return Math.round(pricePaise / (1 - discountPct / 100) / 100) * 100;
}

export function HomeShop({ products }: { products: ProductListItem[] }) {
  const addProduct = useCart((s) => s.addProduct);

  const [concern, setConcern] = useState("all");
  const [type, setType] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(3);
  const [revealing, setRevealing] = useState(false);
  const [selPack, setSelPack] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<string | null>(null);
  const addedTimer = useRef<number>(0);

  useEffect(() => {
    const update = () => setPreview(colCount());
    update();
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(update, 180);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, []);

  const list = products.filter(
    (p) =>
      (concern === "all" || p.concerns.includes(concern)) &&
      (type === "all" || p.type === type),
  );
  const show = expanded ? list : list.slice(0, preview);

  function tierIndex(p: ProductListItem): number {
    return selPack[p.id] ?? defaultTierIndex(p.packTiers);
  }

  function add(p: ProductListItem) {
    const tier = p.packTiers[tierIndex(p)];
    if (!tier) return;
    addProduct(p.id, tier.key);
    window.clearTimeout(addedTimer.current);
    setAdded(p.id);
    addedTimer.current = window.setTimeout(() => setAdded(null), 1200);
  }

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      setRevealing(true);
      window.setTimeout(() => setRevealing(false), 650);
    } else {
      document.getElementById("shop")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <>
      <span className="anchor" id="shop"></span>
      <section className="section" style={{ paddingTop: "clamp(56px,7vw,96px)" }}>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Shop Wellbeing</span>
            <h2>Clinically-backed nutrition, delivered.</h2>
            <p>
              Hydration sachets and functional gummies formulated around the
              concern you care about — each clinically validated and made with
              our botanical bioactives.
            </p>
          </div>

          <div className="shop-filters reveal">
            <span className="filter-label">Concern</span>
            <button
              className={`chip${concern === "all" ? " active" : ""}`}
              onClick={() => setConcern("all")}
            >
              All
            </button>
            {CONCERN_OPTIONS.map((c) => (
              <button
                key={c.key}
                className={`chip${concern === c.key ? " active" : ""}`}
                onClick={() => {
                  setConcern(c.key);
                  setExpanded(false);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="shop-filters reveal" style={{ marginBottom: 4 }}>
            <span className="filter-label">Format</span>
            {[
              { key: "all", label: "All" },
              { key: "hydration", label: "Hydration" },
              { key: "gummy", label: "Gummies" },
            ].map((t) => (
              <button
                key={t.key}
                className={`chip${type === t.key ? " active" : ""}`}
                onClick={() => {
                  setType(t.key);
                  setExpanded(false);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={`shop-grid reveal${revealing ? " revealing" : ""}`}>
            {list.length === 0 ? (
              <p style={{ color: "var(--muted)", gridColumn: "1/-1" }}>
                No products match — try another filter.
              </p>
            ) : (
              show.map((p) => {
                const idx = tierIndex(p);
                const tier = p.packTiers[idx];
                const cmp = tier
                  ? comparePaise(tier.price_paise, tier.discount_pct)
                  : null;
                const firstConcern = p.concerns[0];
                const pc = CONCERN_COLOR[firstConcern] ?? "var(--teal)";
                const image = p.images[0];
                const placeholder = PRODUCT_PLACEHOLDER[p.type];
                return (
                  <div
                    className="prod"
                    key={p.id}
                    style={{ "--pc": pc } as React.CSSProperties}
                  >
                    <div className="prod-art">
                      <span className="ptype">
                        {p.type === "gummy" ? "Gummy" : "Hydration"}
                      </span>
                      {firstConcern ? (
                        <span className="pconcern">
                          {CONCERN_LABEL.get(firstConcern) ?? firstConcern}
                        </span>
                      ) : null}
                      {image ? (
                        <img
                          className="pimg"
                          src={image.url}
                          alt={image.alt ?? p.name}
                          loading="lazy"
                        />
                      ) : (
                        <span style={{ fontSize: 64 }} aria-hidden>
                          {placeholder.emoji}
                        </span>
                      )}
                    </div>
                    <div className="prod-body">
                      <h3>{p.name}</h3>
                      {p.tagline ? <div className="ptag">{p.tagline}</div> : null}
                      {p.ratingAvg != null ? (
                        <div className="stars">
                          <span className="s">{starString(p.ratingAvg)}</span>
                          <span>{p.ratingAvg.toFixed(1)}</span>
                        </div>
                      ) : null}
                      <div className="packs">
                        {p.packTiers.map((t, i) => (
                          <button
                            key={t.key}
                            className={`pack${i === idx ? " active" : ""}`}
                            onClick={() =>
                              setSelPack((s) => ({ ...s, [p.id]: i }))
                            }
                          >
                            <span className="pk">{t.label}</span>
                            <span className="pp">
                              {formatPaiseINR(t.price_paise)}
                            </span>
                            {t.discount_pct > 0 ? (
                              <span className="save">Save {t.discount_pct}%</span>
                            ) : (
                              <span className="save">&nbsp;</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="prod-foot">
                        <div className="prod-price">
                          {tier ? formatPaiseINR(tier.price_paise) : "—"}
                          {cmp != null && tier && cmp > tier.price_paise ? (
                            <>
                              {" "}
                              <s>{formatPaiseINR(cmp)}</s>
                            </>
                          ) : null}
                        </div>
                        <button
                          className={`add-btn${added === p.id ? " added" : ""}`}
                          onClick={() => add(p)}
                        >
                          {added === p.id ? "Added ✓" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {list.length > preview ? (
            <div className="shop-more" style={{ display: "flex" }}>
              <button
                className={`shop-more-btn${expanded ? " open" : ""}`}
                type="button"
                onClick={toggleExpanded}
              >
                <span className="lbl">
                  {expanded
                    ? "Show fewer"
                    : `See more products (${list.length - preview})`}
                </span>
                <ChevronDown />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
