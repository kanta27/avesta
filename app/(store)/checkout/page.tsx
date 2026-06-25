import type { Metadata } from "next";

import { SectionHead } from "@/components/ui/SectionHead";
import { CheckoutForm } from "@/components/store/checkout/CheckoutForm";
import { requireUser, getProfile } from "@/lib/auth/customer";

// Reads the customer's profile via the session; never cache a personalized page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details and pay securely.",
  alternates: { canonical: "/checkout" },
  robots: { index: false },
};

/** Pull a saved-address field off the loose JSON column for prefill. */
function addressField(address: unknown, key: string): string {
  if (address && typeof address === "object" && !Array.isArray(address)) {
    const v = (address as Record<string, unknown>)[key];
    return typeof v === "string" ? v : "";
  }
  return "";
}

/**
 * Single-page, prepaid checkout (feature 5). Login is REQUIRED before purchase:
 * `requireUser()` redirects guests to `/login?next=/checkout`. The signed-in
 * customer's profile prefills the delivery fields; the order is then tied to
 * their account at create-order. The form + order summary live in the
 * `CheckoutForm` client island because the cart is client-only (localStorage).
 * All money is re-priced server-side — the summary here is display-only.
 */
export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const profile = await getProfile(user.id);

  const initial = {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    email: user.email ?? "",
    line1: addressField(profile?.default_address, "line1"),
    line2: addressField(profile?.default_address, "line2"),
    city: addressField(profile?.default_address, "city"),
    state: addressField(profile?.default_address, "state"),
    pincode: addressField(profile?.default_address, "pincode"),
  };

  return (
    <section id="checkout">
      <div className="wrap checkout-wrap">
        <SectionHead
          kicker="Checkout"
          title="Secure checkout"
          description="Delivery details and payment in one step."
        />
        <CheckoutForm initial={initial} />
      </div>
    </section>
  );
}
