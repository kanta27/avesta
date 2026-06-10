import type { Metadata } from "next";

import { TrackOrderClient } from "@/components/store/track/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Avesta order with your order number and phone.",
  // A lookup page over personal orders — keep it out of the index.
  robots: { index: false, follow: false },
};

/**
 * /track — guest order lookup (feature 7).
 *
 * Thin server shell: the whole interaction (form → POST /api/track → status
 * timeline / history / reorder) is client-side, so it lives in the
 * `TrackOrderClient` island. No order data is read here — the lookup is gated by
 * (order number + phone) inside the rate-limited API route.
 */
export default function TrackPage() {
  return (
    <section id="track">
      <div className="wrap track-wrap">
        <h1 className="track-title">Track your order</h1>
        <p className="track-sub">
          Enter your order number and the phone number you ordered with to see
          its status.
        </p>
        <TrackOrderClient />
      </div>
    </section>
  );
}
