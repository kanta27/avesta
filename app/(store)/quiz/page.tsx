import type { Metadata } from "next";

import { getActiveProducts } from "@/lib/products/queries";
import { QuizFlow } from "@/components/store/QuizFlow";

export const metadata: Metadata = {
  title: "60-second health quiz",
  description:
    "Answer 5 quick questions and we'll match you to the Avesta Nordic formula that fits your routine — plus 10% off your first order.",
  alternates: { canonical: "/quiz" },
};

/**
 * `/quiz` — the 60-second health-concern quiz (feature 20).
 *
 * Server component: loads the live ACTIVE catalog once (under RLS) and hands it
 * to the client flow, which runs the questions, derives the recommendation from
 * `product.concerns` and captures a consented lead via the shared `/api/leads`.
 */
export default async function QuizPage() {
  const products = await getActiveProducts();

  return (
    <section>
      <div className="wrap" style={{ maxWidth: 760, paddingTop: 48, paddingBottom: 72 }}>
        <QuizFlow products={products} />
      </div>
    </section>
  );
}
