"use client";

import type { CSSProperties, ReactNode } from "react";
import { OPEN_LEAD_EVENT } from "@/components/store/LeadPopup";

/** Button that opens the lead popup (used as the QuizBand CTA). */
export function LeadTriggerButton({
  children,
  variant = "primary",
  className = "",
  style,
}: {
  children: ReactNode;
  variant?: "primary" | "lime" | "ghost";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className={`btn btn-${variant}${className ? ` ${className}` : ""}`}
      style={style}
      onClick={() => window.dispatchEvent(new Event(OPEN_LEAD_EVENT))}
    >
      {children}
    </button>
  );
}
