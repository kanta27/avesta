"use client";

import { useState, useTransition } from "react";
import { setProductActiveAction } from "@/app/admin/(dashboard)/products/actions";

/**
 * Inline active/inactive toggle for the products list (feature 12). Client island
 * only to manage pending UI — the write is the `setProductActiveAction` server
 * action (requireAdmin + service role). No service-role code reaches the browser.
 */
export function ProductActiveToggle({
  id,
  initialActive,
}: {
  id: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !active;
    startTransition(async () => {
      const res = await setProductActiveAction(id, next);
      if (res.ok) setActive(next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={active}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "bg-lime/40 text-ink hover:bg-lime/60"
          : "bg-line/60 text-grey hover:bg-line"
      }`}
    >
      {active ? "Active" : "Hidden"}
    </button>
  );
}
