import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopProductCard } from "@/components/store/ShopProductCard";
import { getActiveProducts } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse Avesta's range of hydration drinks and nutrient gummies — filter by health concern and product type.",
};

type SearchParams = Promise<{ concern?: string; type?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const concern = typeof sp.concern === "string" ? sp.concern : undefined;
  const type =
    sp.type === "hydration" || sp.type === "gummy" ? sp.type : undefined;

  const all = await getActiveProducts();
  const products = all.filter(
    (p) =>
      (!concern || p.concerns.includes(concern)) &&
      (!type || p.type === type),
  );

  return (
    <section id="shop">
      <div className="wrap">
        <SectionHead
          kicker="Shop"
          title="The full range"
          description="Hydration drinks and nutrient gummies — every formula clinically made and scientifically tested. Filter by concern or type."
        />
        <ShopFilters concern={concern} type={type} />
        <p className="filter-count" role="status" aria-live="polite">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
        {products.length > 0 ? (
          <div className="prod-grid">
            {products.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="shop-empty">
            No products match these filters.{" "}
            <Link href="/shop">Clear filters</Link>
          </p>
        )}
      </div>
    </section>
  );
}
