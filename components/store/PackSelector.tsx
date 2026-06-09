"use client";

import { useState } from "react";

/**
 * Pack-tier pills on a product card. Tracks the selected pill locally; pass
 * `onChange` to react to selection (e.g. the Shop card recomputes ₹ / ₹-per-day
 * from the chosen tier). Without `onChange` it's a purely visual toggle, as in
 * the A1 homepage port.
 */
export function PackSelector({
  packs,
  defaultIndex = 0,
  onChange,
}: {
  packs: readonly string[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
}) {
  const [active, setActive] = useState(defaultIndex);

  function select(i: number) {
    setActive(i);
    onChange?.(i);
  }

  return (
    <div className="packs">
      {packs.map((p, i) => (
        <button
          type="button"
          key={p}
          className={`pack${i === active ? " on" : ""}`}
          aria-pressed={i === active}
          onClick={() => select(i)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
