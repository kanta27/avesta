import { Button } from "@/components/ui/Button";
import { PackSelector } from "@/components/store/PackSelector";

export interface Product {
  name: string;
  /** Science line, e.g. "Na⁺ K⁺ Mg²⁺ · GLUCOSE-OPTIMIZED". */
  sci: string;
  /** Filled/empty star string, e.g. "★★★★★" or "★★★★☆". */
  stars: string;
  /** Rating note, e.g. "4.6 · AMAZON VERIFIED". */
  ratingNote: string;
  packs: readonly string[];
  defaultPackIndex: number;
  price: string;
  perDay: string;
  emoji: string;
  /** CSS background for the image placeholder (gradient in the demo). */
  imgBackground: string;
  tag?: string;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="prod">
      <div className="img" style={{ background: product.imgBackground }}>
        {product.tag ? <span className="tag">{product.tag}</span> : null}
        <span aria-hidden>{product.emoji}</span>
      </div>
      <div className="body">
        <h3>{product.name}</h3>
        <div className="sci">{product.sci}</div>
        <div className="stars" aria-label={`Rated ${product.ratingNote}`}>
          <span aria-hidden>{product.stars}</span>{" "}
          <small>{product.ratingNote}</small>
        </div>
        <PackSelector
          packs={product.packs}
          defaultIndex={product.defaultPackIndex}
        />
        <div className="price-row">
          <span className="price">{product.price}</span>
          <span className="perday">{product.perDay}</span>
        </div>
        <Button variant="lime" className="add">
          Add to cart
        </Button>
      </div>
    </div>
  );
}
