"use client";

import { useState, useTransition } from "react";

import {
  setApprovedAction,
  setFeaturedAction,
} from "@/app/admin/(dashboard)/testimonials/actions";

/**
 * Inline approve + feature toggles for the testimonials list (feature 17).
 * Client island only for pending/optimistic UI — the writes are the
 * `setApprovedAction` / `setFeaturedAction` server actions (requireAdmin +
 * service role). Only approved reviews are ever public (RLS); featuring an
 * approved review is what surfaces it on the homepage strip.
 */

const pill =
  "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50";

export function ReviewToggles({
  id,
  initialApproved,
  initialFeatured,
}: {
  id: string;
  initialApproved: boolean;
  initialFeatured: boolean;
}) {
  const [approved, setApproved] = useState(initialApproved);
  const [featured, setFeatured] = useState(initialFeatured);
  const [pending, startTransition] = useTransition();

  function toggleApproved() {
    const next = !approved;
    setApproved(next); // optimistic
    startTransition(async () => {
      const res = await setApprovedAction(id, next);
      if (!res.ok) setApproved(!next); // revert
    });
  }

  function toggleFeatured() {
    const next = !featured;
    setFeatured(next); // optimistic
    startTransition(async () => {
      const res = await setFeaturedAction(id, next);
      if (!res.ok) setFeatured(!next); // revert
    });
  }

  return (
    <span className="inline-flex gap-1.5">
      <button
        type="button"
        onClick={toggleApproved}
        disabled={pending}
        aria-pressed={approved}
        className={`${pill} ${
          approved
            ? "bg-lime/40 text-ink hover:bg-lime/60"
            : "bg-line/60 text-grey hover:bg-line"
        }`}
      >
        {approved ? "Approved" : "Pending"}
      </button>
      <button
        type="button"
        onClick={toggleFeatured}
        disabled={pending}
        aria-pressed={featured}
        title={
          approved ? undefined : "Approve first — only approved reviews are public."
        }
        className={`${pill} ${
          featured
            ? "bg-amber/30 text-ink hover:bg-amber/50"
            : "bg-line/60 text-grey hover:bg-line"
        }`}
      >
        {featured ? "★ Featured" : "Feature"}
      </button>
    </span>
  );
}
