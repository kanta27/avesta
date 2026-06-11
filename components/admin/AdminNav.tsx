"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Admin sidebar nav (feature 12). Client island only because it needs
 * `usePathname()` for active-link highlighting — it writes nothing and never
 * touches Supabase, so no server-only code reaches the browser bundle here.
 *
 * The five Phase 1 modules are linked. Blog / Testimonials / Gallery (Phase 2)
 * remain intentionally absent.
 */
const NAV = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 md:flex-col">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-card px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-ink text-white"
                : "text-grey hover:bg-paper hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
