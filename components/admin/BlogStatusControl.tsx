"use client";

import { useState, useTransition } from "react";

import { transitionStatusAction } from "@/app/admin/(dashboard)/blog/actions";
import { BLOG_STATUSES, type BlogStatus } from "@/lib/blog/types";

/**
 * Inline status transition for the blog list (feature 16). Client island for
 * pending UI only — the write is `transitionStatusAction` (requireAdmin +
 * service role), which stamps `published_at` on the first move to published.
 *
 * Publishing is a deliberate human action: changing the select to "published"
 * is the ONLY way an automation draft (status='review') ever goes live.
 */
export function BlogStatusControl({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: BlogStatus;
}) {
  const [status, setStatus] = useState<BlogStatus>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(next: BlogStatus) {
    const prev = status;
    setStatus(next); // optimistic
    setError(null);
    startTransition(async () => {
      const res = await transitionStatusAction(id, next);
      if (!res.ok) {
        setStatus(prev); // revert on failure
        setError(res.error);
      }
    });
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <select
        aria-label="Post status"
        value={status}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as BlogStatus)}
        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
          status === "published"
            ? "border-lime-deep bg-lime/40 text-ink"
            : status === "review"
              ? "border-amber bg-amber/20 text-ink"
              : "border-line bg-line/40 text-grey"
        }`}
      >
        {BLOG_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </span>
  );
}
