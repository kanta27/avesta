import type { Metadata } from "next";
import Link from "next/link";

import { SectionHead } from "@/components/ui/SectionHead";
import { requireUser, getProfile } from "@/lib/auth/customer";
import { getOrdersForUser } from "@/lib/orders/customer";
import { formatPaiseINR } from "@/lib/format";
import { AccountProfileForm, type ProfileFormValues } from "./AccountProfileForm";

// Reads RLS-locked orders via the service-role client; never cache a customer's
// account view.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your profile and view your orders.",
  robots: { index: false, follow: false },
};

/** Pull the saved-address fields off the loose JSON column for the form. */
function addressField(address: unknown, key: string): string {
  if (address && typeof address === "object" && !Array.isArray(address)) {
    const v = (address as Record<string, unknown>)[key];
    return typeof v === "string" ? v : "";
  }
  return "";
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [profile, orders] = await Promise.all([
    getProfile(user.id),
    getOrdersForUser(user.id),
  ]);

  const values: ProfileFormValues = {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    line1: addressField(profile?.default_address, "line1"),
    line2: addressField(profile?.default_address, "line2"),
    city: addressField(profile?.default_address, "city"),
    state: addressField(profile?.default_address, "state"),
    pincode: addressField(profile?.default_address, "pincode"),
    consentWhatsapp: profile?.consent_whatsapp ?? false,
  };

  return (
    <section className="account-section">
      <div className="wrap account-wrap">
        <SectionHead
          kicker="Account"
          title="Your account"
          description={`Signed in as ${user.email ?? "your account"}.`}
        />

        <div className="account-grid">
          <div className="account-col">
            <h2 className="account-heading">Profile</h2>
            <AccountProfileForm values={values} />

            <form
              action="/auth/signout"
              method="post"
              className="account-signout"
            >
              <button type="submit" className="btn btn-ghost">
                Sign out
              </button>
            </form>
          </div>

          <div className="account-col">
            <h2 className="account-heading">Your orders</h2>
            {orders.length === 0 ? (
              <div className="account-empty">
                <p>You haven&apos;t placed any orders yet.</p>
                <Link className="btn btn-brass account-shop" href="/shop">
                  Browse products
                </Link>
              </div>
            ) : (
              <ul className="account-orders">
                {orders.map((o) => (
                  <li key={o.id} className="account-order">
                    <Link
                      href={`/order/confirmed?id=${encodeURIComponent(o.id)}`}
                      className="account-order-link"
                    >
                      <span className="account-order-no mono">
                        {o.orderNumber}
                      </span>
                      <span className="account-order-meta">
                        {formatDate(o.createdAt)} · {o.itemCount} item
                        {o.itemCount === 1 ? "" : "s"}
                      </span>
                      <span className={`account-order-status status-${o.status}`}>
                        {o.status}
                      </span>
                      <span className="account-order-total">
                        {formatPaiseINR(o.totalPaise)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
