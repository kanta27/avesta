"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createPostAction,
  updatePostAction,
} from "@/app/admin/(dashboard)/blog/actions";
import { slugify } from "@/lib/blog/slug";
import { BLOG_STATUSES, type AdminBlogPost } from "@/lib/blog/types";
import { Markdown } from "@/components/blog/Markdown";

/**
 * Blog create/edit form (feature 16, module 3). Client component for local form
 * state + a live markdown PREVIEW (reuses the same sanitizing `<Markdown>` as
 * the public page, so the preview is exactly what readers get). The write is a
 * server action (`requireAdmin` + service role); this file imports nothing
 * server-only — `slugify` and the `<Markdown>` renderer are both client-safe.
 */

const inputCls =
  "w-full rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";
const labelCls = "mb-1 block text-sm font-medium";

export function BlogEditor({ post }: { post?: AdminBlogPost }) {
  const router = useRouter();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  // Auto-derive the slug from the title until the admin edits the slug by hand
  // (or on an existing post, which already has one).
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [bodyMd, setBodyMd] = useState(post?.bodyMd ?? "");
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.cover?.url ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.cover?.alt ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seoDescription ?? "",
  );
  const [status, setStatus] = useState(post?.status ?? "draft");

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      slug,
      excerpt,
      body_md: bodyMd,
      tags,
      cover_image: coverUrl.trim()
        ? { url: coverUrl.trim(), alt: coverAlt.trim() || undefined }
        : null,
      seo_title: seoTitle,
      seo_description: seoDescription,
      status,
    };

    const res =
      isEdit && post
        ? await updatePostAction(post.id, payload)
        : await createPostAction(payload);

    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Edit post" : "New post"}
        </h1>
        {isEdit && post ? (
          <span className="font-mono text-xs uppercase tracking-wide text-grey">
            {post.source} · {post.status}
          </span>
        ) : null}
      </div>

      {error && (
        <p className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div>
        <label htmlFor={fid("title")} className={labelCls}>
          Title
        </label>
        <input
          id={fid("title")}
          className={inputCls}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
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
          placeholder="best-supplement-for-hydration"
          required
        />
        <p className="mt-1 text-xs text-grey">
          URL: /blog/{slug || "…"} · lowercase words, hyphen-separated.
        </p>
      </div>

      <div>
        <label htmlFor={fid("excerpt")} className={labelCls}>
          Excerpt
        </label>
        <textarea
          id={fid("excerpt")}
          className={inputCls}
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="One- or two-line summary shown on the index and in search."
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor={fid("body")} className={labelCls}>
            Body (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="btn btn-ghost text-xs"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        {showPreview ? (
          <div className="min-h-[200px] rounded-card border border-line bg-white px-4 py-3">
            {bodyMd.trim() ? (
              <Markdown source={bodyMd} />
            ) : (
              <p className="text-sm text-grey">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            id={fid("body")}
            className={`${inputCls} font-mono`}
            rows={16}
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            placeholder={"## Heading\n\nWrite the article in Markdown…"}
          />
        )}
        <p className="mt-1 text-xs text-grey">
          Rendered through an allowlist sanitizer — raw HTML and unsafe links are
          stripped.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("cover-url")} className={labelCls}>
            Cover image URL
          </label>
          <input
            id={fid("cover-url")}
            className={inputCls}
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <label htmlFor={fid("cover-alt")} className={labelCls}>
            Cover alt text
          </label>
          <input
            id={fid("cover-alt")}
            className={inputCls}
            value={coverAlt}
            onChange={(e) => setCoverAlt(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor={fid("tags")} className={labelCls}>
          Tags
        </label>
        <input
          id={fid("tags")}
          className={inputCls}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="hydration, immunity"
        />
        <p className="mt-1 text-xs text-grey">Comma-separated.</p>
      </div>

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
            placeholder="Falls back to the title"
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
            placeholder="Falls back to the excerpt"
          />
        </div>
      </div>

      <div>
        <label htmlFor={fid("status")} className={labelCls}>
          Status
        </label>
        <select
          id={fid("status")}
          className={inputCls}
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as (typeof BLOG_STATUSES)[number])
          }
        >
          {BLOG_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-grey">
          Publishing stamps the publish date. Only a human admin can publish.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary text-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="btn btn-ghost text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
