import type { Metadata } from "next";

import { SectionHead } from "@/components/ui/SectionHead";
import { CheckoutForm } from "@/components/store/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details and pay securely.",
  alternates: { canonical: "/checkout" },
  robots: { index: false },
};

/**
 * Single-page, guest, prepaid checkout (feature 5). The form + order summary
 * live in the `CheckoutForm` client island because the cart is client-only
 * (localStorage). All money is re-priced server-side at create-order — the
 * summary here is display-only, joined from the catalog.
 */
export default function CheckoutPage() {
  return (
    <section id="checkout">
      <div className="wrap checkout-wrap">
        <SectionHead
          kicker="Checkout"
          title="Secure checkout"
          description="Delivery details and payment in one step — no account needed."
        />
        <CheckoutForm />
      </div>
    </section>
  );
}
