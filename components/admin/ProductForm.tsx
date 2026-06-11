"use client";

import { useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CONCERN_OPTIONS } from "@/lib/products/types";
import type {
  Bioactive,
  Faq,
  Ingredient,
  PackTier,
} from "@/lib/products/types";
import type { ProductInput } from "@/lib/products/validation";
import {
  createImageUploadUrlAction,
  saveProductAction,
} from "@/app/admin/(dashboard)/products/actions";

/**
 * Product create/edit form (feature 12, module 1).
 *
 * Client component for interactivity ONLY — the write path is the server actions
 * it imports (`saveProductAction` / `createImageUploadUrlAction`), each of which
 * calls `requireAdmin()` and uses the service role server-side. This file never
 * imports the service-role client; image bytes upload directly to a server-issued
 * signed URL using the anon browser client.
 *
 * Money is handled as integer paise in state; the price inputs display rupees and
 * convert on edit, so nothing leaves here as a float.
 */

type ImageItem = { url: string; alt?: string };

const inputCls =
  "w-full rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";
const labelCls = "block text-sm font-medium text-ink";
const hintCls = "mt-1 text-xs text-grey";

const paiseToRupees = (p: number): string => (p ? String(p / 100) : "");
const rupeesToPaise = (s: string): number => {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function Section({
  title,
  children,
  hint,
}: {
  title: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {hint && <p className={hintCls}>{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Generic repeatable-row editor — the spec's "small repeatable-row editor", reused
 *  for pack tiers, ingredients, bioactives and FAQs. */
function RepeatableRows<T>({
  rows,
  blank,
  onChange,
  renderRow,
  addLabel,
}: {
  rows: T[];
  blank: () => T;
  onChange: (rows: T[]) => void;
  renderRow: (row: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-card border border-line bg-paper-2 p-3"
        >
          {renderRow(
            row,
            (patch) =>
              onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r))),
            i,
          )}
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            className="mt-2 text-xs font-medium text-red-700 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, blank()])}
        className="btn btn-ghost text-sm"
      >
        + {addLabel}
      </button>
    </div>
  );
}

export interface ProductFormProps {
  /** null → create mode; otherwise the product id being edited. */
  productId: string | null;
  /** Initial values (an existing product in edit mode, or blank defaults). */
  initial: ProductInput;
}

export function ProductForm({ productId, initial }: ProductFormProps) {
  const router = useRouter();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(productId !== null);
  const [type, setType] = useState<ProductInput["type"]>(initial.type);
  const [tagline, setTagline] = useState(initial.tagline ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [concerns, setConcerns] = useState<string[]>(initial.concerns);
  const [packTiers, setPackTiers] = useState<PackTier[]>(initial.pack_tiers);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial.ingredients,
  );
  const [bioactives, setBioactives] = useState<Bioactive[]>(initial.bioactives);
  const [scienceHtml, setScienceHtml] = useState(initial.science_html ?? "");
  const [faqs, setFaqs] = useState<Faq[]>(initial.faqs);
  const [whoFor, setWhoFor] = useState(initial.who_for ?? "");
  const [whoNotFor, setWhoNotFor] = useState(initial.who_not_for ?? "");
  const [badges, setBadges] = useState(initial.badges.join(", "));
  const [images, setImages] = useState<ImageItem[]>(initial.images);
  const [stockCount, setStockCount] = useState(String(initial.stock_count));
  const [isActive, setIsActive] = useState(initial.is_active);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleConcern(key: string) {
    setConcerns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  }

  /** Setting one tier default behaves like a radio — clears the others. */
  function updateTierDefault(index: number) {
    setPackTiers((prev) =>
      prev.map((t, i) => ({ ...t, is_default: i === index })),
    );
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.includes(".")
        ? file.name.split(".").pop() ?? "bin"
        : "bin";
      const res = await createImageUploadUrlAction(slug || name || "product", ext);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("products")
        .uploadToSignedUrl(res.target.path, res.target.token, file, {
          contentType: file.type || undefined,
        });
      if (upErr) {
        setError(`Upload failed: ${upErr.message}`);
        return;
      }
      setImages((prev) => [...prev, { url: res.target.publicUrl, alt: "" }]);
    } finally {
      setUploading(false);
    }
  }

  function buildPayload(): unknown {
    return {
      name,
      slug,
      type,
      tagline,
      description,
      concerns,
      pack_tiers: packTiers,
      ingredients,
      bioactives,
      science_html: scienceHtml,
      faqs,
      who_for: whoFor,
      who_not_for: whoNotFor,
      badges: badges
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
      images,
      stock_count: Number.parseInt(stockCount, 10) || 0,
      is_active: isActive,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await saveProductAction(productId, buildPayload());
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {productId ? "Edit product" : "New product"}
        </h1>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active (visible on storefront)
        </label>
      </div>

      {error && (
        <p className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <Section title="Basics">
        <div>
          <label htmlFor={fid("name")} className={labelCls}>
            Name
          </label>
          <input
            id={fid("name")}
            className={inputCls}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fid("slug")} className={labelCls}>
              Slug
            </label>
            <input
              id={fid("slug")}
              className={inputCls}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
            />
            <p className={hintCls}>Lowercase, hyphenated. Used in the URL.</p>
          </div>
          <div>
            <label htmlFor={fid("type")} className={labelCls}>
              Type
            </label>
            <select
              id={fid("type")}
              className={inputCls}
              value={type}
              onChange={(e) =>
                setType(e.target.value as ProductInput["type"])
              }
            >
              <option value="hydration">Hydration</option>
              <option value="gummy">Gummy</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor={fid("tagline")} className={labelCls}>
            Tagline
          </label>
          <input
            id={fid("tagline")}
            className={inputCls}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={fid("stock")} className={labelCls}>
            Stock count
          </label>
          <input
            id={fid("stock")}
            className={inputCls}
            type="number"
            min={0}
            value={stockCount}
            onChange={(e) => setStockCount(e.target.value)}
          />
        </div>
        <fieldset>
          <legend className={labelCls}>Concerns</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {CONCERN_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={concerns.includes(opt.key)}
                  onChange={() => toggleConcern(opt.key)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section
        title="Pack tiers"
        hint="At least one. Prices in ₹ (stored as paise). Mark one as the default pack."
      >
        <RepeatableRows<PackTier>
          rows={packTiers}
          onChange={setPackTiers}
          blank={() => ({
            key: "",
            label: "",
            units: 0,
            price_paise: 0,
            discount_pct: 0,
            per_day_paise: 0,
            is_default: packTiers.length === 0,
          })}
          addLabel="Add pack tier"
          renderRow={(row, update, index) => (
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-xs">
                Key
                <input
                  className={inputCls}
                  value={row.key}
                  onChange={(e) => update({ key: e.target.value })}
                  placeholder="30"
                />
              </label>
              <label className="text-xs">
                Label
                <input
                  className={inputCls}
                  value={row.label}
                  onChange={(e) => update({ label: e.target.value })}
                  placeholder="30-day"
                />
              </label>
              <label className="text-xs">
                Units
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  value={row.units || ""}
                  onChange={(e) =>
                    update({ units: Number.parseInt(e.target.value, 10) || 0 })
                  }
                />
              </label>
              <label className="text-xs">
                Price (₹)
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  step="0.01"
                  value={paiseToRupees(row.price_paise)}
                  onChange={(e) =>
                    update({ price_paise: rupeesToPaise(e.target.value) })
                  }
                />
              </label>
              <label className="text-xs">
                Discount %
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={100}
                  value={row.discount_pct || ""}
                  onChange={(e) =>
                    update({ discount_pct: Number(e.target.value) || 0 })
                  }
                />
              </label>
              <label className="text-xs">
                Per-day (₹)
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  step="0.01"
                  value={paiseToRupees(row.per_day_paise)}
                  onChange={(e) =>
                    update({ per_day_paise: rupeesToPaise(e.target.value) })
                  }
                />
              </label>
              <label className="col-span-full flex items-center gap-1.5 text-xs">
                <input
                  type="radio"
                  name="default-tier"
                  checked={row.is_default}
                  onChange={() => updateTierDefault(index)}
                />
                Default pack
              </label>
            </div>
          )}
        />
      </Section>

      <Section title="Images" hint="Uploaded to the products storage bucket.">
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="w-40 rounded-card border border-line bg-paper-2 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="h-24 w-full rounded object-cover"
              />
              <input
                className={`${inputCls} mt-2`}
                placeholder="Alt text"
                value={img.alt ?? ""}
                onChange={(e) =>
                  setImages((prev) =>
                    prev.map((p, idx) =>
                      idx === i ? { ...p, alt: e.target.value } : p,
                    ),
                  )
                }
              />
              <button
                type="button"
                onClick={() =>
                  setImages((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="mt-1 text-xs font-medium text-red-700 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <label className="inline-block">
          <span className="btn btn-ghost cursor-pointer text-sm">
            {uploading ? "Uploading…" : "Upload image"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </Section>

      <Section
        title="Ingredients"
        hint="What's in the product (e.g. Vitamin C · 80 · mg)."
      >
        <RepeatableRows<Ingredient>
          rows={ingredients}
          onChange={setIngredients}
          blank={() => ({ name: "", amount: "", unit: "" })}
          addLabel="Add ingredient"
          renderRow={(row, update) => (
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className={inputCls}
                placeholder="Name"
                value={row.name}
                onChange={(e) => update({ name: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Amount"
                value={String(row.amount ?? "")}
                onChange={(e) => update({ amount: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Unit"
                value={row.unit ?? ""}
                onChange={(e) => update({ unit: e.target.value })}
              />
            </div>
          )}
        />
      </Section>

      <Section
        title="Bioactives"
        hint="Structure/function language only — no therapeutic claims. Customer-facing copy needs Avesthagen sign-off."
      >
        <RepeatableRows<Bioactive>
          rows={bioactives}
          onChange={setBioactives}
          blank={() => ({ name: "", role: "", evidence_url: "" })}
          addLabel="Add bioactive"
          renderRow={(row, update) => (
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className={inputCls}
                placeholder="Name"
                value={row.name}
                onChange={(e) => update({ name: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Role (supports…)"
                value={row.role ?? ""}
                onChange={(e) => update({ role: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Evidence URL"
                value={row.evidence_url ?? ""}
                onChange={(e) => update({ evidence_url: e.target.value })}
              />
            </div>
          )}
        />
      </Section>

      <Section title="FAQs">
        <RepeatableRows<Faq>
          rows={faqs}
          onChange={setFaqs}
          blank={() => ({ q: "", a: "" })}
          addLabel="Add FAQ"
          renderRow={(row, update) => (
            <div className="space-y-2">
              <input
                className={inputCls}
                placeholder="Question"
                value={row.q}
                onChange={(e) => update({ q: e.target.value })}
              />
              <textarea
                className={inputCls}
                placeholder="Answer"
                rows={2}
                value={row.a}
                onChange={(e) => update({ a: e.target.value })}
              />
            </div>
          )}
        />
      </Section>

      <Section
        title="Long-form copy"
        hint="Structure/function claims only. Needs Avesthagen sign-off before publish."
      >
        <div>
          <label htmlFor={fid("description")} className={labelCls}>
            Description
          </label>
          <textarea
            id={fid("description")}
            className={inputCls}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fid("who-for")} className={labelCls}>
              Who it&apos;s for
            </label>
            <textarea
              id={fid("who-for")}
              className={inputCls}
              rows={3}
              value={whoFor}
              onChange={(e) => setWhoFor(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={fid("who-not-for")} className={labelCls}>
              Who it&apos;s not for
            </label>
            <textarea
              id={fid("who-not-for")}
              className={inputCls}
              rows={3}
              value={whoNotFor}
              onChange={(e) => setWhoNotFor(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor={fid("science")} className={labelCls}>
            The Science (HTML)
          </label>
          <textarea
            id={fid("science")}
            className={`${inputCls} font-mono text-xs`}
            rows={4}
            value={scienceHtml}
            onChange={(e) => setScienceHtml(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={fid("badges")} className={labelCls}>
            Badges
          </label>
          <input
            id={fid("badges")}
            className={inputCls}
            value={badges}
            onChange={(e) => setBadges(e.target.value)}
            placeholder="FSSAI, Clinically tested, GMP"
          />
          <p className={hintCls}>Comma-separated.</p>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="btn btn-primary disabled:opacity-60"
        >
          {saving ? "Saving…" : productId ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="btn btn-ghost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
