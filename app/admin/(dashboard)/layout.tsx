import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Authenticated admin chrome (feature 12).
 *
 * This lives in the `(dashboard)` route group so it wraps ONLY the signed-in
 * admin pages. The login + auth-callback pages sit directly under `app/admin/`
 * and share `app/admin/layout.tsx` (the minimal pass-through) but NOT this
 * layout — which matters because this layout calls `requireAdmin()`, and running
 * that on `/admin/login` would redirect to `/admin/login` in a loop.
 *
 * `requireAdmin()` re-gates here server-side on top of the edge proxy. Every
 * mutation under this tree independently calls `requireAdmin()` again before it
 * touches the service-role client — a layout gate is not a substitute for the
 * per-action gate (a direct POST to a server action bypasses layouts).
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-paper text-ink md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-line bg-paper-2 px-4 py-5 md:min-h-screen md:border-r">
        <Link href="/admin" className="block">
          <p className="font-mono text-xs uppercase tracking-widest text-grey">
            Avesta Health
          </p>
          <p className="mt-0.5 text-lg font-semibold">Admin</p>
        </Link>

        <div className="mt-6">
          <AdminNav />
        </div>

        <div className="mt-6 border-t border-line pt-4 text-sm">
          <p className="truncate text-grey" title={user.email ?? undefined}>
            {user.email}
          </p>
          <form action="/admin/auth/signout" method="post" className="mt-2">
            <button
              type="submit"
              className="font-medium text-grey underline-offset-2 hover:text-ink hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
