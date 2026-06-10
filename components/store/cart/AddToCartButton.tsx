"use client";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/store";

/**
 * Client add-to-cart button for surfaces that are otherwise server components
 * (e.g. `BundleCard`). Adds a ref to the cart and opens the drawer (the store's
 * add actions flip `isOpen`). Product surfaces that already manage a selected
 * pack (PackPricing, ProductBuyBox) call the store directly instead.
 *
 * Props carry REFS ONLY — never a price.
 */
type Props =
  | { kind: "product"; productId: string; packKey: string; label?: string; className?: string }
  | { kind: "bundle"; bundleId: string; label?: string; className?: string };

export function AddToCartButton(props: Props) {
  const addProduct = useCart((s) => s.addProduct);
  const addBundle = useCart((s) => s.addBundle);

  const onClick = () => {
    if (props.kind === "product") addProduct(props.productId, props.packKey);
    else addBundle(props.bundleId);
  };

  return (
    <Button
      variant="lime"
      className={props.className ?? "add"}
      onClick={onClick}
    >
      {props.label ?? "Add to cart"}
    </Button>
  );
}
