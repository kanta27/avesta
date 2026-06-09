import Link from "next/link";
import {
  CONCERN_OPTIONS,
  TYPE_OPTIONS,
  type FilterOption,
} from "@/lib/products/types";

interface ActiveFilters {
  concern?: string;
  type?: string;
}

/** Build a `/shop` href from a full filter state (omits empty params). */
function hrefFor(filters: ActiveFilters): string {
  const params = new URLSearchParams();
  if (filters.concern) params.set("concern", filters.concern);
  if (filters.type) params.set("type", filters.type);
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`pack${active ? " on" : ""}`}
      aria-current={active ? "true" : undefined}
    >
      {label}
    </Link>
  );
}

function FilterGroup({
  label,
  options,
  paramKey,
  active,
  current,
}: {
  label: string;
  options: readonly FilterOption[];
  paramKey: "concern" | "type";
  active: string | undefined;
  current: ActiveFilters;
}) {
  return (
    <div className="filter-group" role="group" aria-label={`Filter by ${label}`}>
      <span className="filter-label">{label}</span>
      <FilterChip
        label="All"
        href={hrefFor({ ...current, [paramKey]: undefined })}
        active={!active}
      />
      {options.map((opt) => {
        const isActive = active === opt.key;
        // Clicking the active chip clears it; otherwise it becomes the selection.
        const next = { ...current, [paramKey]: isActive ? undefined : opt.key };
        return (
          <FilterChip
            key={opt.key}
            label={opt.label}
            href={hrefFor(next)}
            active={isActive}
          />
        );
      })}
    </div>
  );
}

/**
 * Concern + type filters for the Shop page. Pure links that drive `/shop`'s URL
 * search params (shareable, server-rendered, accessible) — no client state.
 */
export function ShopFilters({ concern, type }: ActiveFilters) {
  const current: ActiveFilters = { concern, type };
  return (
    <nav className="shop-filters" aria-label="Filter products">
      <FilterGroup
        label="Concern"
        options={CONCERN_OPTIONS}
        paramKey="concern"
        active={concern}
        current={current}
      />
      <FilterGroup
        label="Type"
        options={TYPE_OPTIONS}
        paramKey="type"
        active={type}
        current={current}
      />
    </nav>
  );
}
