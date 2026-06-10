import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaiseINR } from "@/lib/format";
import type { PricedItem } from "@/lib/checkout/pricing";

// Reads the RLS-locked `orders` table via the service-role client.
export const runtime = "nodejs";
// Always render fresh for the specific order — never cache a customer's order.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your order has been placed.",
  robots: { index: false, follow: false },
};

/**
 * Order confirmation page (feature 6).
 *
 * SECURITY — keyed by the order's non-guessable UUID (`orders.id`), NOT the
 * sequential `order_number`. The 06 spec's example uses `?no=<order_number>`,
 * but order numbers (AV-2026-000123) are guessable, so that would let anyone
 * enumerate other customers' orders. We deliberately key on the UUID instead and
 * accept ONLY `?id=` — there is no code path that looks an order up by number,
 * so guessing a number reveals nothing.
 *
 * The order is read SERVER-SIDE via the service-role client (orders is
 * RLS-locked; there is no public read path) and only summary-safe fields are
 * shown — no payment internals.
 */
export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  // A missing or non-UUID key can never match a real order — 404 without a DB
  // round-trip, and without leaking whether any given id exists.
  if (!id || !UUID_RE.test(id)) notFound();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, items, total_paise, created_at, status")
    .eq("id", id)
    .maybeSingle();

  // Unknown id, or an order that never reached payment — show nothing.
  if (!order || order.status === "created") notFound();

  const items = (order.items as unknown as PricedItem[]) ?? [];
  const estimate = deliveryEstimate(order.created_at);

  return (
    <section id="order-confirmed">
      <div className="wrap order-confirmed-wrap">
        <p className="order-confirmed-emoji" aria-hidden>
          ✅
        </p>
        <h1 className="order-confirmed-title">Order confirmed</h1>
        <p className="order-confirmed-sub">
          Thank you — your payment was successful and we&apos;re getting your
          order ready.
        </p>

        <dl className="order-confirmed-meta">
          <div className="order-confirmed-meta-row">
            <dt>Order number</dt>
            <dd className="mono">{order.order_number}</dd>
          </div>
          <div className="order-confirmed-meta-row">
            <dt>Estimated delivery</dt>
            <dd>{estimate}</dd>
          </div>
        </dl>

        <div className="order-confirmed-card">
          <h2 className="order-confirmed-card-title">Order summary</h2>
          <ul className="order-confirmed-lines">
            {items.map((item, i) => (
              <li
                className="order-confirmed-line"
                key={`${item.kind}-${item.product_id ?? item.bundle_id ?? i}-${item.pack_key ?? ""}`}
              >
                <span className="order-confirmed-line-name">
                  {item.name}
                  {item.pack_key ? (
                    <span className="order-confirmed-line-pack mono">
                      {item.pack_key}
                    </span>
                  ) : null}
                  <span className="order-confirmed-line-qty mono">
                    Qty {item.qty}
                  </span>
                </span>
                <span className="order-confirmed-line-price">
                  {formatPaiseINR(item.line_total_paise)}
                </span>
              </li>
            ))}
          </ul>
          <div className="order-confirmed-total">
            <span>Total paid</span>
            <span>{formatPaiseINR(order.total_paise)}</span>
          </div>
        </div>

        <div className="order-confirmed-next">
          <p className="order-confirmed-next-title">What happens next</p>
          <ul className="order-confirmed-next-list">
            <li>
              You&apos;ll get <strong>WhatsApp updates</strong> as your order is
              packed and shipped.
            </li>
            <li>
              {/* Track-order is feature 7 — placeholder link until it ships. */}
              Track your order anytime from the{" "}
              <a className="order-confirmed-link" href="/track">
                track-order page
              </a>{" "}
              <span className="order-confirmed-soon mono">(coming soon)</span>.
            </li>
          </ul>
        </div>

        <Button variant="lime" href="/shop">
          Continue shopping
        </Button>

        <p className="order-confirmed-disclaimer mono">
          These products are not intended to diagnose, treat, cure or prevent any
          disease.
        </p>
      </div>
    </section>
  );
}

/** RFC-4122-ish UUID matcher — enough to reject obviously non-UUID keys early. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Friendly delivery estimate computed from the order date — display-only, no
 * schema. A 5–7 day window from when the order was placed.
 */
function deliveryEstimate(createdAt: string | null): string {
  const placed = createdAt ? new Date(createdAt) : new Date();
  const from = new Date(placed);
  from.setDate(from.getDate() + 5);
  const to = new Date(placed);
  to.setDate(to.getDate() + 7);

  const fmt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  });
  return `${fmt.format(from)} – ${fmt.format(to)}`;
}
