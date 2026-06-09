import { requireAdmin } from "@/lib/auth/require-admin";

/**
 * Placeholder admin dashboard (A6). The real CMS modules are feature 12.
 *
 * `requireAdmin()` re-checks the session server-side here — belt-and-suspenders
 * with the edge middleware. Any future mutation on this page must run as a
 * server action that ALSO calls `requireAdmin()` before using the service-role
 * client; nothing here writes yet.
 */
export default async function AdminHomePage() {
  const user = await requireAdmin();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-grey">
          Avesta Health · Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
        <p className="mt-3 text-sm text-grey">
          Signed in as{" "}
          <span className="font-medium text-ink">{user.email}</span>.
        </p>

        <div className="mt-8 rounded-card border border-line bg-paper-2 px-5 py-4">
          <p className="text-sm text-grey">
            Admin modules (products, orders, leads, content) arrive in feature
            12. This page confirms the auth gate works.
          </p>
        </div>

        <form action="/admin/auth/signout" method="post" className="mt-8">
          <button type="submit" className="btn btn-ghost">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
