import { Hero } from "@/components/store/Hero";
import { TrustStrip } from "@/components/store/TrustStrip";
import { ConcernGrid } from "@/components/store/ConcernGrid";
import { Products } from "@/components/store/Products";
import { SciencePipeline } from "@/components/store/SciencePipeline";
import { Reviews } from "@/components/store/Reviews";
import { ResearchCards } from "@/components/store/ResearchCards";
import { QuizBand } from "@/components/store/QuizBand";
import { BlogTeasers } from "@/components/store/BlogTeasers";
import { LeadTriggerButton } from "@/components/store/LeadTriggerButton";
import { Reveal } from "@/components/ui/Reveal";
import type { Product } from "@/components/store/ProductCard";

// Sample homepage products for the A1 port. Replaced by the live catalog
// (Supabase) in feature 1; the demo's placeholder branding is intentional.
const SAMPLE_PRODUCTS: readonly Product[] = [
  {
    name: "HydraSci™ Daily Electrolyte",
    sci: "Na⁺ K⁺ Mg²⁺ · GLUCOSE-OPTIMIZED",
    stars: "★★★★★",
    ratingNote: "4.6 · AMAZON VERIFIED",
    packs: ["15-DAY", "30-DAY −10%", "90-DAY −15%"],
    defaultPackIndex: 1,
    price: "₹1,098",
    perDay: "₹37/DAY",
    emoji: "🥤",
    imgBackground: "linear-gradient(150deg,#E3F4FB,#CBE9F4)",
    tag: "BESTSELLER",
  },
  {
    name: "HydraSci™ Energy +",
    sci: "B-COMPLEX · NATURAL CAFFEINE",
    stars: "★★★★☆",
    ratingNote: "4.4 · TATA 1MG",
    packs: ["15-DAY", "30-DAY −10%", "90-DAY −15%"],
    defaultPackIndex: 1,
    price: "₹1,198",
    perDay: "₹40/DAY",
    emoji: "🥤",
    imgBackground: "linear-gradient(150deg,#FFF0DC,#FBDFB6)",
  },
  {
    name: "VitaGum™ Immunity",
    sci: "VIT C + D3 + ZINC · 30 GUMMIES",
    stars: "★★★★★",
    ratingNote: "4.7 · AMAZON VERIFIED",
    packs: ["15-DAY", "30-DAY −10%", "90-DAY −15%"],
    defaultPackIndex: 1,
    price: "₹898",
    perDay: "₹30/DAY",
    emoji: "🍬",
    imgBackground: "linear-gradient(150deg,#F3E9FB,#E2D2F2)",
    tag: "NEW",
  },
  {
    name: "VitaGum™ Hair & Skin",
    sci: "BIOTIN · AMLA BIOACTIVES",
    stars: "★★★★☆",
    ratingNote: "4.5 · TATA 1MG",
    packs: ["15-DAY", "30-DAY −10%", "90-DAY −15%"],
    defaultPackIndex: 1,
    price: "₹998",
    perDay: "₹33/DAY",
    emoji: "🍬",
    imgBackground: "linear-gradient(150deg,#E5F6E8,#CDEBD4)",
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Reveal>
        <ConcernGrid />
      </Reveal>
      <Reveal>
        <Products products={SAMPLE_PRODUCTS} />
      </Reveal>
      <Reveal>
        <SciencePipeline />
      </Reveal>
      <Reveal>
        <Reviews />
      </Reveal>
      <Reveal>
        <ResearchCards />
      </Reveal>
      <Reveal>
        <QuizBand
          cta={
            <LeadTriggerButton style={{ fontSize: 16, padding: "16px 30px" }}>
              Find my formula →
            </LeadTriggerButton>
          }
        />
      </Reveal>
      <Reveal>
        <BlogTeasers />
      </Reveal>
    </>
  );
}
