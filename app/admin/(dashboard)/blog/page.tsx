import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { listAllPosts } from "@/lib/blog/admin";
import {
  BLOG_SOURCES,
  BLOG_STATUSES,
  type BlogSource,
  type BlogStatus,
} from "@/lib/blog/types";
import { formatDate } from "@/lib/format";
import { BlogStatusControl } from "@/components/admin/BlogStatusControl";

type SearchParams = Promise<{ status?: string; source?: string }>;

function asStatus(v: string | undefined): BlogStatus | undefined {
  return BLOG_STATUSES.includes(v as BlogStatus) ? (v as BlogStatus) : undefined;
}
function asSource(v: string | undefined): BlogSource | undefined {
  return BLOG_SOURCES.includes(v as BlogSource) ? (v as BlogSource) : undefined;
}

/** Build a filter link, preserving the other active filter. */
function filterHref(
  next: { status?: BlogStatus; source?: BlogSource },
): string {
  const params = new URLSearchParams();
  if (next.status) params.set("status", next.status);
  if (next.source) params.set("source", next.source);
  const qs = params.toString();
  return qs ? `/admin/blog?${qs}` : "/admin/blog";
}

const pill =
  "rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const pillOn = "border-ink bg-ink text-white";
const pillOff = "border-line bg-white text-grey hover:border-ink hover:text-ink";

/** Blog admin list (feature 16), filterable by status + source. */
export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status = asStatus(sp.status);
  const source = asSource(sp.source);

  const posts = await listAllPosts({ status, source });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="mt-1 text-sm text-grey">
            {posts.length} post{posts.length === 1 ? "" : "s"}
            {status ? ` · ${status}` : ""}
            {source ? ` · ${source}` : ""}.
          </p>
        </div>
        <Link href="/admin/blog/new" className="btn btn-primary text-sm">
          + New post
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-grey">Status</span>
          <Link
            href={filterHref({ source })}
            className={`${pill} ${!status ? pillOn : pillOff}`}
          >
            All
          </Link>
          {BLOG_STATUSES.map((s) => (
            <Link
              key={s}
              href={filterHref({ status: s, source })}
              className={`${pill} ${status === s ? pillOn : pillOff}`}
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-grey">Source</span>
          <Link
            href={filterHref({ status })}
            className={`${pill} ${!source ? pillOn : pillOff}`}
          >
            All
          </Link>
          {BLOG_SOURCES.map((s) => (
            <Link
              key={s}
              href={filterHref({ status, source: s })}
              className={`${pill} ${source === s ? pillOn : pillOff}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-paper-2 px-5 py-8 text-center text-sm text-grey">
          No posts match these filters.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left font-mono text-xs uppercase tracking-wide text-grey">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => (
                <tr key={p.id} className="bg-white">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/blog/${p.id}/edit`}
                      className="font-medium text-ink hover:underline"
                    >
                      {p.title}
                    </Link>
                    <span className="block font-mono text-xs text-grey">
                      /{p.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-grey">{p.source}</td>
                  <td className="px-4 py-3 text-grey">
                    {p.publishedAt ? formatDate(p.publishedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <BlogStatusControl id={p.id} initialStatus={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${p.id}/edit`}
                      className="text-xs text-ink-2 hover:underline"
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
