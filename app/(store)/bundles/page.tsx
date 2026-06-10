import type { Metadata } from "next";
import Link from "next/link";

import { SectionHead } from "@/components/ui/SectionHead";
import { BundleCard } from "@/components/store/BundleCard";
import { getActiveBundles } from "@/lib/bundles/queries";

export const metadata: Metadata = {
  title: "Bundles",
  description:
    "Concern-based stacks pairing a hydration drink with a nutrient gummy — bundled below the price of buying each separately.",
  alternates: { canonical: "/bundles" },
};

export default async function BundlesPage() {
  const bundles = await getActiveBundles();

  return (
    <section id="bundles">
      <div className="wrap">
        <SectionHead
          kicker="Bundles"
          title="Stacks built around your goal"
          description="Each stack pairs a hydration drink with a complementary gummy — priced below buying the two separately."
        />

        {bundles.length > 0 ? (
          <div className="bundle-grid">
            {bundles.map((b) => (
              <BundleCard key={b.id} bundle={b} />
            ))}
          </div>
        ) : (
          <p className="shop-empty">
            No bundles are available right now.{" "}
            <Link href="/shop">Browse the full range</Link> instead.
          </p>
        )}

        <p className="placeholder-note" role="note">
          Placeholder bundles — names and pricing are pending Avesthagen sign-off.
        </p>
      </div>
    </section>
  );
}
