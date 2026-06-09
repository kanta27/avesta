"use client";

import { useState } from "react";

/**
 * Pack-tier pills on a product card. Purely visual selection for the A1 port
 * (matches the demo's toggle); real pricing/pack logic arrives with the Cart
 * and Catalog features.
 */
export function PackSelector({
  packs,
  defaultIndex = 0,
}: {
  packs: readonly string[];
  defaultIndex?: number;
}) {
  const [active, setActive] = useState(defaultIndex);

  return (
    <div className="packs">
      {packs.map((p, i) => (
        <button
          type="button"
          key={p}
          className={`pack${i === active ? " on" : ""}`}
          aria-pressed={i === active}
          onClick={() => setActive(i)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
