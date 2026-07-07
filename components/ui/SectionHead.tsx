import type { ReactNode } from "react";

interface SectionHeadProps {
  /** Mono kicker, e.g. "01 — Start here". */
  kicker: string;
  title: ReactNode;
  /** Optional descriptive paragraph (right-aligned in the demo layout). */
  description?: ReactNode;
  /** Optional aside rendered in place of the description (e.g. a button). */
  children?: ReactNode;
}

/** The repeated `.sec-head` block: kicker + h2 + optional description/aside. */
export function SectionHead({
  kicker,
  title,
  description,
  children,
}: SectionHeadProps) {
  return (
    <div className="sec-head">
      <div>
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}
