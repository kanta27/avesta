"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper: fades/slides children up the first time they enter
 * the viewport (IntersectionObserver), matching the demo's `.reveal` → `.in`.
 * Honors prefers-reduced-motion by showing immediately.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced-motion users get content shown immediately via CSS (see the
    // prefers-reduced-motion block in globals.css); the observer still runs.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${shown ? " in" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
