import type { Metadata } from "next";

import { RevealObserver } from "@/components/home/RevealObserver";
import { Hero } from "@/components/home/Hero";
import { Partners } from "@/components/home/Partners";
import { Explore } from "@/components/home/Explore";
import { Science } from "@/components/home/Science";
import { Avestagenome } from "@/components/home/Avestagenome";
import { Portfolio } from "@/components/home/Portfolio";
import { HomeShop } from "@/components/home/HomeShop";
import { HomeQuiz } from "@/components/home/HomeQuiz";
import { ReviewsWall } from "@/components/home/ReviewsWall";
import { ImgBand } from "@/components/home/ImgBand";
import { ResearchNetwork } from "@/components/home/ResearchNetwork";
import { Insights } from "@/components/home/Insights";
import { CtaBand } from "@/components/home/CtaBand";
import { ContactSection } from "@/components/home/ContactSection";
import { getActiveProducts } from "@/lib/products/queries";

export const metadata: Metadata = {
  // Reference page title/description (design/reference.html <head>).
  title: {
    absolute: "Avesta Wellbeing · Bringing Science to Life",
  },
  description:
    "Avesta Wellbeing — 25+ years at the convergence of botanical wisdom and precision genomics. Predictive, Preventive, Personalized healthcare: clinically validated nutrition, NGS diagnostics, biosimilars and more.",
  alternates: { canonical: "/" },
};

/**
 * Homepage — a 1:1 port of design/reference.html, section for section:
 * hero → partners → explore → science → avestagenome → portfolio → shop →
 * quiz → reviews → credibility band → research → insights → CTA → contact.
 * Static copy is the reference's verbatim; the shop grid and quiz band are
 * hydrated from the live Supabase catalog and the shared cart store.
 */
export default async function Home() {
  const products = await getActiveProducts();

  return (
    <>
      <RevealObserver />
      <Hero />
      <Partners />
      <Explore />
      <Science />
      <Avestagenome />
      <Portfolio />
      <HomeShop products={products} />
      <HomeQuiz products={products} />
      <ReviewsWall />
      <ImgBand />
      <ResearchNetwork />
      <Insights />
      <CtaBand />
      <ContactSection />
    </>
  );
}
