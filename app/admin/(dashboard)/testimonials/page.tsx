import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { listReviews, type AdminReviewFilters } from "@/lib/reviews/admin";
import {
  isReviewSource,
  sourceLabel,
  starString,
  REVIEW_SOURCES,
  type ReviewSource,
} from "@/lib/reviews/types";
import { formatDate } from "@/lib/format";
import { ReviewToggles } from "@/components/admin/ReviewToggles";

type SearchParams = Promise<{
  source?: string;
  approval?: string;
  featured?: string;
}>;

function asSource(v: string | undefined): ReviewSource | undefined {
  return v && isReviewSource(v) ? v : undefined;
}
function asApproval(v: string | undefined): "approved" | "pending" | undefined {
  return v === "approved" || v === "pending" ? v : undefined;
}

/** Build a filter link, preserving the other active filters. */
function filterHref(next: {
  source?: ReviewSource;
  approval?: "approved" | "pending";
  featured?: boolean;
}): string {
  const params = new URLSearchParams();
  if (next.source) params.set("source", next.source);
  if (next.approval) params.set("approval", next.approval);
  if (next.featured) params.set("featured", "1");
  const qs = params.toString();
  return qs ? `/admin/testimonials?${qs}` : "/admin/testimonials";
}

const pill =
  "rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const pillOn = "border-ink bg-ink text-white";
const pillOff = "border-line bg-white text-grey hover:border-ink hover:text-ink";

/** Testimonials admin list (feature 17), filterable by source/approval/featured. */
export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const source = asSource(sp.source);
  const approval = asApproval(sp.approval);
  const featured = sp.featured === "1";

  const filters: AdminReviewFilters = { source, approval, featured };
  const reviews = await listReviews(filters);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Testimonials</h1>
          <p className="mt-1 text-sm text-grey">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
            {source ? ` · ${sourceLabel(source)}` : ""}
            {approval ? ` · ${approval}` : ""}
            {featured ? " · featured" : ""}.
          </p>
        </div>
        <Link href="/admin/testimonials/new" className="btn btn-primary text-sm">
          + New testimonial
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-grey">Source</span>
          <Link
            href={filterHref({ approval, featured })}
            className={`${pill} ${!source ? pillOn : pillOff}`}
          >
            All
          </Link>
          {REVIEW_SOURCES.map((s) => (
            <Link
              key={s}
              href={filterHref({ source: s, approval, featured })}
              className={`${pill} ${source === s ? pillOn : pillOff}`}
            >
              {sourceLabel(s)}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-grey">Approval</span>
          <Link
            href={filterHref({ source, featured })}
            className={`${pill} ${!approval ? pillOn : pillOff}`}
          >
            All
          </Link>
          {(["approved", "pending"] as const).map((a) => (
            <Link
              key={a}
              href={filterHref({ source, approval: a, featured })}
              className={`${pill} ${approval === a ? pillOn : pillOff}`}
            >
              {a}
            </Link>
          ))}
          <span className="ml-3 font-mono text-xs uppercase text-grey">
            Featured
          </span>
          <Link
            href={filterHref({ source, approval, featured: !featured })}
            className={`${pill} ${featured ? pillOn : pillOff}`}
          >
            {featured ? "★ Featured only" : "Featured only"}
          </Link>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-paper-2 px-5 py-8 text-center text-sm text-grey">
          No reviews match these filters.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left font-mono text-xs uppercase tracking-wide text-grey">
              <tr>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reviews.map((r) => {
                const thirdParty = r.source === "amazon" || r.source === "tata1mg";
                return (
                  <tr key={r.id} className="bg-white align-top">
                    <td className="max-w-sm px-4 py-3">
                      <div className="text-amber" aria-hidden>
                        {starString(r.rating)}
                      </div>
                      {thirdParty ? (
                        <p className="mt-1 text-xs text-grey">
                          Link-out badge —{" "}
                          {r.reelUrl ? (
                            <a
                              href={r.reelUrl}
                              target="_blank"
                              rel="noreferrer noopener nofollow"
                              className="text-ink-2 underline"
                            >
                              {sourceLabel(r.source)} listing ↗
                            </a>
                          ) : (
                            <span className="text-red-700">no link</span>
                          )}
                        </p>
                      ) : (
                        <>
                          {r.body ? (
                            <p className="mt-1 line-clamp-3 text-grey">{r.body}</p>
                          ) : (
                            <p className="mt-1 text-xs italic text-grey">
                              (no text)
                            </p>
                          )}
                          <p className="mt-1 text-xs text-grey">
                            {r.authorName ?? "Verified buyer"}
                            {r.location ? ` · ${r.location}` : ""}
                          </p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-grey">{sourceLabel(r.source)}</td>
                    <td className="px-4 py-3 text-grey">
                      {r.productName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-grey">
                      {r.createdAt ? formatDate(r.createdAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ReviewToggles
                        id={r.id}
                        initialApproved={r.isApproved}
                        initialFeatured={r.isFeatured}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
