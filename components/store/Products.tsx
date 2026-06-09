import { SectionHead } from "@/components/ui/SectionHead";
import { Button } from "@/components/ui/Button";
import { ProductCard, type Product } from "@/components/store/ProductCard";

export function Products({ products }: { products: readonly Product[] }) {
  return (
    <section id="shop">
      <div className="wrap">
        <SectionHead
          kicker="02 — The range"
          title="Seven formulas. Zero guesswork."
          description="Three hydration drinks. Four nutrient gummies. Every one clinically made and scientifically tested."
        />
        <div className="prod-grid">
          {products.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Button variant="ghost" href="#shop">
            View all 7 products + combo stacks →
          </Button>
        </div>
      </div>
    </section>
  );
}
