"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 to `end` when scrolled into view (matches the demo's
 * animated stats). SSR renders 0, so there's no hydration mismatch. Honors
 * prefers-reduced-motion by jumping straight to the final value.
 */
export function Counter({
  end,
  suffix = "",
  duration = 1200,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started) continue;
          started = true;
          io.unobserve(entry.target);
          if (reduced) {
            setValue(end);
            return;
          }
          let t0: number | null = null;
          const step = (ts: number) => {
            if (t0 === null) t0 = ts;
            const p = Math.min((ts - t0) / duration, 1);
            setValue(Math.floor(p * end));
            if (p < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, duration]);

  return (
    <span ref={ref} className="num">
      {value}
      {suffix}
    </span>
  );
}
