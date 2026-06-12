import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { listAllConcernPages } from "@/lib/concerns/admin";

/** Concern-pages admin list (feature 19). */
export default async function AdminConcernPagesPage() {
  await requireAdmin();
  const pages = await listAllConcernPages();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Concern Pages</h1>
          <p className="mt-1 text-sm text-grey">
            {pages.length} page{pages.length === 1 ? "" : "s"} · each is live at
            its URL the moment it exists.
          </p>
        </div>
        <Link
          href="/admin/concern-pages/new"
          className="btn btn-primary text-sm"
        >
          + New concern page
        </Link>
      </div>

      {pages.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-paper-2 px-5 py-8 text-center text-sm text-grey">
          No concern pages yet.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left font-mono text-xs uppercase tracking-wide text-grey">
              <tr>
                <th className="px-4 py-3">Concern</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">FAQs</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pages.map((p) => (
                <tr key={p.id} className="bg-white">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/concern-pages/${p.id}/edit`}
                      className="font-medium text-ink hover:underline"
                    >
                      {p.concern}
                    </Link>
                    <span className="block font-mono text-xs text-grey">
                      /health-concern/{p.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-grey">{p.productCount}</td>
                  <td className="px-4 py-3 text-grey">{p.faqCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/health-concern/${p.slug}`}
                      className="text-xs text-ink-2 hover:underline"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/concern-pages/${p.id}/edit`}
                      className="ml-3 text-xs text-ink-2 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
