import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

/**
 * Admin dashboard landing (feature 12).
 *
 * `requireAdmin()` runs here too (not only in the layout): the repo rule is that
 * every protected admin page gates itself, so a page is never reachable on the
 * strength of a layout alone. It returns the signed-in user for the greeting.
 *
 * Deliberately minimal — module entry points only. Counts / charts are the
 * Analytics dashboard (feature 13), out of scope here.
 */
const MODULES = [
  {
    href: "/admin/products",
    title: "Products",
    desc: "Catalog, pack tiers, images, stock, active state.",
  },
  {
    href: "/admin/orders",
    title: "Orders",
    desc: "Fulfilment — status transitions, tracking, customer notify.",
  },
  {
    href: "/admin/discounts",
    title: "Discounts",
    desc: "Codes, value, minimums, usage limits, expiry.",
  },
  {
    href: "/admin/leads",
    title: "Leads",
    desc: "Captured leads, conversion, CSV export.",
  },
] as const;

export default async function AdminHomePage() {
  const user = await requireAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-widest text-grey">
        Dashboard
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-grey">
        Signed in as <span className="font-medium text-ink">{user.email}</span>.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-card border border-line bg-paper-2 px-5 py-4 transition-colors hover:border-ink"
          >
            <p className="font-semibold">{m.title}</p>
            <p className="mt-1 text-sm text-grey">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
