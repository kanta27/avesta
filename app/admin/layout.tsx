import type { ReactNode } from "react";

export const metadata = {
  title: "Admin — Avesta Health",
  // Keep the admin area out of search indexes regardless of auth state.
  robots: { index: false, follow: false },
};

/**
 * Admin route group layout. Intentionally minimal — the gating lives in
 * `middleware.ts` and `requireAdmin()`, not here. The real admin chrome
 * (nav, modules) lands in feature 12.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
