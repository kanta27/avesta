"use client";

import { useState, useTransition } from "react";
import { setDiscountActiveAction } from "@/app/admin/(dashboard)/discounts/actions";

/**
 * Inline active/inactive toggle for the discounts list (feature 12). Client
 * island only for pending UI — the write is `setDiscountActiveAction`
 * (requireAdmin + service role). Deactivating is the no-code kill switch: it
 * flips `is_active`, which the checkout validator rejects immediately.
 */
export function DiscountActiveToggle({
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
      const res = await setDiscountActiveAction(id, next);
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
      {active ? "Active" : "Inactive"}
    </button>
  );
}
