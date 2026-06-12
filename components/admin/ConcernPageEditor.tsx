"use client";

import { useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  createConcernPageAction,
  updateConcernPageAction,
} from "@/app/admin/(dashboard)/concern-pages/actions";
import type { ConcernFaq, ConcernPage } from "@/lib/concerns/types";
import { Markdown } from "@/components/blog/Markdown";

/**
 * Concern-page create/edit form (feature 19). Client component for local form
 * state, a repeatable FAQ-row editor (the same pattern as the product form's
 * pack tiers), a product multi-select over ACTIVE products, and a live markdown
 * PREVIEW that reuses the public page's sanitizing `<Markdown>`.
 *
 * The write path is the server actions it imports (`requireAdmin` + service
 * role); this file imports nothing server-only. `concern_pages` has no status
 * column — a page is live the moment it's saved — so there is no draft/publish
 * control here.
 *
 * COMPLIANCE: any placeholder/helper text below is structure/function only and
 * never therapeutic; example content is left to the admin to author.
 */

const inputCls =
  "w-full rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";
const labelCls = "mb-1 block text-sm font-medium";

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** A product as offered in the multi-select. */
export interface ProductOption {
  id: string;
  name: string;
  type: string;
}

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
      {hint && <p className="mt-1 text-xs text-grey">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export interface ConcernPageEditorProps {
  /** Existing page in edit mode; omitted in create mode. */
  page?: ConcernPage;
  /** Active products to choose from for the matched-product grid. */
  productOptions: ProductOption[];
}

export function ConcernPageEditor({
  page,
  productOptions,
}: ConcernPageEditorProps) {
  const router = useRouter();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const isEdit = !!page;

  const [concern, setConcern] = useState(page?.concern ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [h1, setH1] = useState(page?.h1 ?? "");
  const [introMd, setIntroMd] = useState(page?.introMd ?? "");
  const [faqs, setFaqs] = useState<ConcernFaq[]>(page?.faqs ?? []);
  const [productIds, setProductIds] = useState<string[]>(
    page?.productIds ?? [],
  );
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    page?.seoDescription ?? "",
  );

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onConcernChange(value: string) {
    setConcern(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleProduct(id: string) {
    setProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function updateFaq(index: number, patch: Partial<ConcernFaq>) {
    setFaqs((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug,
      concern,
      h1,
      intro_md: introMd,
      faqs,
      product_ids: productIds,
      seo_title: seoTitle,
      seo_description: seoDescription,
    };

    const res =
      isEdit && page
        ? await updateConcernPageAction(page.id, payload)
        : await createConcernPageAction(payload);

    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    router.push("/admin/concern-pages");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6 pb-16">
      <h1 className="text-2xl font-semibold">
        {isEdit ? "Edit concern page" : "New concern page"}
      </h1>

      {error && (
        <p className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <Section title="Basics">
        <div>
          <label htmlFor={fid("concern")} className={labelCls}>
            Concern label
          </label>
          <input
            id={fid("concern")}
            className={inputCls}
            value={concern}
            onChange={(e) => onConcernChange(e.target.value)}
            placeholder="Hydration"
            required
          />
          <p className="mt-1 text-xs text-grey">
            Shown in the breadcrumb and the “Shop all …” link.
          </p>
        </div>
        <div>
          <label htmlFor={fid("slug")} className={labelCls}>
            Slug
          </label>
          <input
            id={fid("slug")}
            className={`${inputCls} font-mono`}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="hydration"
            required
          />
          <p className="mt-1 text-xs text-grey">
            URL: /health-concern/{slug || "…"} · lowercase words,
            hyphen-separated. The “Shop all” link points to /shop?concern=
            {slug || "…"}.
          </p>
        </div>
        <div>
          <label htmlFor={fid("h1")} className={labelCls}>
            H1 heading
          </label>
          <input
            id={fid("h1")}
            className={inputCls}
            value={h1}
            onChange={(e) => setH1(e.target.value)}
            placeholder="Falls back to the concern label"
          />
        </div>
      </Section>

      <Section
        title="Intro (Markdown)"
        hint="Structure/function language only — never therapeutic claims. Rendered through an allowlist sanitizer; raw HTML and unsafe links are stripped."
      >
        <div className="mb-1 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="btn btn-ghost text-xs"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        {showPreview ? (
          <div className="min-h-[160px] rounded-card border border-line bg-white px-4 py-3">
            {introMd.trim() ? (
              <Markdown source={introMd} />
            ) : (
              <p className="text-sm text-grey">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            id={fid("intro")}
            className={`${inputCls} font-mono`}
            rows={12}
            value={introMd}
            onChange={(e) => setIntroMd(e.target.value)}
            placeholder={"## Heading\n\nWrite the landing-page intro in Markdown…"}
          />
        )}
      </Section>

      <Section title="Matched products" hint="Active products only. The grid shows them in the order selected.">
        {productOptions.length === 0 ? (
          <p className="text-sm text-grey">
            No active products yet. Add products first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {productOptions.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={productIds.includes(opt.id)}
                  onChange={() => toggleProduct(opt.id)}
                />
                {opt.name}
                <span className="font-mono text-xs text-grey">
                  ({opt.type})
                </span>
              </label>
            ))}
          </div>
        )}
      </Section>

      <Section title="FAQs" hint="Powers the on-page FAQ section and the FAQPage structured data.">
        <div className="space-y-3">
          {faqs.map((row, i) => (
            <div
              key={i}
              className="rounded-card border border-line bg-paper-2 p-3"
            >
              <div className="space-y-2">
                <input
                  className={inputCls}
                  placeholder="Question"
                  value={row.q}
                  onChange={(e) => updateFaq(i, { q: e.target.value })}
                />
                <textarea
                  className={inputCls}
                  placeholder="Answer"
                  rows={2}
                  value={row.a}
                  onChange={(e) => updateFaq(i, { a: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setFaqs((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="mt-2 text-xs font-medium text-red-700 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFaqs((prev) => [...prev, { q: "", a: "" }])}
            className="btn btn-ghost text-sm"
          >
            + Add FAQ
          </button>
        </div>
      </Section>

      <Section title="SEO">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fid("seo-title")} className={labelCls}>
              SEO title
            </label>
            <input
              id={fid("seo-title")}
              className={inputCls}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Falls back to the H1 / concern"
            />
          </div>
          <div>
            <label htmlFor={fid("seo-desc")} className={labelCls}>
              SEO description
            </label>
            <input
              id={fid("seo-desc")}
              className={inputCls}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary text-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create page"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/concern-pages")}
          className="btn btn-ghost text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
