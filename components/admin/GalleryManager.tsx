"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import {
  GALLERY_CATEGORIES,
  categoryLabel,
  type GalleryCategory,
  type GalleryImage,
} from "@/lib/gallery/types";
import {
  createGalleryImageAction,
  createGalleryUploadUrlAction,
  deleteGalleryImageAction,
  reorderGalleryAction,
  updateGalleryImageAction,
} from "@/app/admin/(dashboard)/gallery/actions";

/**
 * Gallery admin manager (feature 21, module 1).
 *
 * Client component for interactivity ONLY — every write goes through the server
 * actions it imports, each of which calls `requireAdmin()` and uses the service
 * role server-side. This file never imports the service-role client; image bytes
 * upload directly to a server-issued signed URL with the anon browser client,
 * pointed at the `gallery` bucket.
 */

const inputCls =
  "w-full rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";

type RowStatus = "idle" | "saving" | "saved" | "error";

export function GalleryManager({ initial }: { initial: GalleryImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>(initial);
  const [uploadCategory, setUploadCategory] =
    useState<GalleryCategory>("product");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, RowStatus>>({});

  function patchRow(id: string, patch: Partial<GalleryImage>) {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }
  function setRowStatus(id: string, s: RowStatus) {
    setStatus((prev) => ({ ...prev, [id]: s }));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.includes(".")
        ? file.name.split(".").pop() ?? "bin"
        : "bin";
      const urlRes = await createGalleryUploadUrlAction(uploadCategory, ext);
      if (!urlRes.ok) {
        setError(urlRes.error);
        return;
      }
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("gallery")
        .uploadToSignedUrl(urlRes.target.path, urlRes.target.token, file, {
          contentType: file.type || undefined,
        });
      if (upErr) {
        setError(`Upload failed: ${upErr.message}`);
        return;
      }

      // Persist the row. Alt defaults to a filename-derived placeholder the admin
      // edits below — but it must be non-empty (the public grid needs alt text).
      const alt = file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim() ||
        `${categoryLabel(uploadCategory)} image`;
      const createRes = await createGalleryImageAction({
        url: urlRes.target.publicUrl,
        alt,
        category: uploadCategory,
      });
      if (!createRes.ok) {
        setError(createRes.error);
        return;
      }
      setImages((prev) => [
        ...prev,
        {
          id: createRes.id,
          url: urlRes.target.publicUrl,
          alt,
          category: uploadCategory,
          sort: prev.length,
        },
      ]);
    } finally {
      setUploading(false);
    }
  }

  async function saveRow(img: GalleryImage) {
    setRowStatus(img.id, "saving");
    setError(null);
    const res = await updateGalleryImageAction(img.id, {
      url: img.url,
      alt: img.alt,
      category: img.category,
    });
    if (!res.ok) {
      setRowStatus(img.id, "error");
      setError(res.error);
      return;
    }
    setRowStatus(img.id, "saved");
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    const reindexed = next.map((img, i) => ({ ...img, sort: i }));
    setImages(reindexed);
    const res = await reorderGalleryAction(reindexed.map((img) => img.id));
    if (!res.ok) {
      setError(res.error);
      setImages(images); // revert on failure
    }
  }

  async function remove(img: GalleryImage) {
    if (
      !window.confirm(
        "Delete this image? This removes it from the public gallery and storage permanently.",
      )
    ) {
      return;
    }
    setRowStatus(img.id, "saving");
    setError(null);
    const res = await deleteGalleryImageAction(img.id);
    if (!res.ok) {
      setRowStatus(img.id, "error");
      setError(res.error);
      return;
    }
    setImages((prev) => prev.filter((i) => i.id !== img.id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {/* Upload */}
      <section className="rounded-card border border-line bg-white p-5">
        <h2 className="text-base font-semibold">Add an image</h2>
        <p className="mt-1 text-xs text-grey">
          Uploaded to the <code>gallery</code> storage bucket. Pick a category,
          then choose a file — it appears below where you can set alt text and
          reorder.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="block font-medium text-ink">Category</span>
            <select
              className={`${inputCls} mt-1`}
              value={uploadCategory}
              onChange={(e) =>
                setUploadCategory(e.target.value as GalleryCategory)
              }
            >
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </label>
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
        </div>
      </section>

      {/* Manage */}
      {images.length === 0 ? (
        <p className="rounded-card border border-line bg-paper-2 px-5 py-8 text-center text-sm text-grey">
          No gallery images yet. Upload one above — it will appear on the public
          gallery immediately.
        </p>
      ) : (
        <ul className="space-y-3">
          {images.map((img, i) => {
            const s = status[img.id] ?? "idle";
            return (
              <li
                key={img.id}
                className="flex flex-wrap items-start gap-4 rounded-card border border-line bg-white p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-24 w-24 shrink-0 rounded-card object-cover"
                />
                <div className="min-w-[240px] flex-1 space-y-2">
                  <label className="block text-xs font-medium text-ink">
                    Alt text
                    <input
                      className={`${inputCls} mt-1`}
                      value={img.alt}
                      onChange={(e) => patchRow(img.id, { alt: e.target.value })}
                      placeholder="Describe the image"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs font-medium text-ink">
                      Category
                      <select
                        className={`${inputCls} mt-1`}
                        value={img.category}
                        onChange={(e) =>
                          patchRow(img.id, {
                            category: e.target.value as GalleryCategory,
                          })
                        }
                      >
                        {GALLERY_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {categoryLabel(c)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col items-stretch gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="rounded-card border border-line px-2 py-1 text-sm disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === images.length - 1}
                      aria-label="Move down"
                      className="rounded-card border border-line px-2 py-1 text-sm disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <span className="ml-1 font-mono text-xs text-grey">
                      #{i + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveRow(img)}
                    disabled={s === "saving"}
                    className="btn btn-primary text-xs disabled:opacity-60"
                  >
                    {s === "saving"
                      ? "Saving…"
                      : s === "saved"
                        ? "Saved ✓"
                        : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(img)}
                    disabled={s === "saving"}
                    className="text-xs font-medium text-red-700 hover:underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
