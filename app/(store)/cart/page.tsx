import type { Metadata } from "next";

import { SectionHead } from "@/components/ui/SectionHead";
import { CartPageBody } from "@/components/store/cart/CartPageBody";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review the products and packs in your cart before checkout.",
  alternates: { canonical: "/cart" },
  robots: { index: false },
};

export default function CartPage() {
  return (
    <section id="cart">
      <div className="wrap cart-page-wrap">
        <SectionHead
          kicker="Cart"
          title="Your cart"
          description="Adjust packs and quantities here — final pricing is confirmed at checkout."
        />
        <CartPageBody />
      </div>
    </section>
  );
}
