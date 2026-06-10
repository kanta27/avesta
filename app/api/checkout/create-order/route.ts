import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createPaymentOrder, getPaymentProvider } from "@/lib/payments";
import { serverEnv } from "@/lib/env.server";
import type { Json, TablesInsert } from "@/lib/supabase";
import { checkoutRequestSchema } from "@/lib/checkout/validation";
import { priceCart } from "@/lib/checkout/pricing";

// Uses node:crypto (via the payment layer) and the service-role client — must run
// on the Node.js runtime, never the edge.
export const runtime = "nodejs";

/**
 * POST /api/checkout/create-order
 *
 * The entry point of checkout. Validates the request at the trust boundary,
 * RE-PRICES the cart from the DB (never trusts client money — guardrail), mints
 * an `AV-YYYY-NNNNNN` order number, creates a provider (mock/Razorpay) order for
 * the server-computed total, upserts the guest customer, and inserts an `orders`
 * row in status `created`. Returns the refs the client needs to pay.
 *
 * All writes use the service-role client (server-only; bypasses RLS) — there is
 * no public write path to `orders`/`customers`.
 */
export async function POST(request: Request) {
  // 1. Parse + validate. Unknown keys (e.g. a smuggled price) are stripped here.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check your details and try again.",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const { items, customer, address, discountCode } = parsed.data;

  // 2. Re-price from the DB. The forged-price path dies here: only refs are read.
  const priced = await priceCart(items);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 409 });
  }
  const { cart } = priced;
  if (cart.totalPaise <= 0) {
    return NextResponse.json(
      { error: "Your order total is invalid. Please review your cart." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // 3. Mint a unique order number (atomic per-year counter — see migration).
  const { data: orderNumber, error: numberError } = await admin.rpc(
    "next_order_number",
  );
  if (numberError || !orderNumber) {
    return NextResponse.json(
      { error: "Could not start your order. Please try again." },
      { status: 500 },
    );
  }

  // 4. Create the provider order for the SERVER total (mock in dev; Razorpay
  //    untouched when keys exist). Only the payment helpers are imported here.
  let providerOrderId: string;
  try {
    const result = await createPaymentOrder({
      amountPaise: cart.totalPaise,
      orderNumber,
      notes: { order_number: orderNumber, phone: customer.phone },
    });
    providerOrderId = result.providerOrderId;
  } catch {
    return NextResponse.json(
      { error: "Could not reach the payment provider. Please try again." },
      { status: 502 },
    );
  }

  // 5. Upsert the guest customer (keyed by normalized phone).
  const { error: customerError } = await admin.from("customers").upsert(
    {
      phone: customer.phone,
      name: customer.name,
      ...(customer.email ? { email: customer.email } : {}),
    },
    { onConflict: "phone" },
  );
  if (customerError) {
    return NextResponse.json(
      { error: "Could not save your details. Please try again." },
      { status: 500 },
    );
  }

  // 6. Insert the order in status `created`, carrying the provider order id so
  //    the confirm call and the webhook can both reconcile against it.
  const orderRow: TablesInsert<"orders"> = {
    order_number: orderNumber,
    customer_phone: customer.phone,
    name: customer.name,
    email: customer.email ?? null,
    items: cart.items as unknown as Json,
    subtotal_paise: cart.subtotalPaise,
    // discount_code is RECORDED only — no discount is applied yet (feature 8).
    discount_code: discountCode ?? null,
    discount_paise: cart.discountPaise, // 0 until feature 8
    shipping_paise: cart.shippingPaise, // 0 (free, approved)
    total_paise: cart.totalPaise,
    status: "created",
    razorpay_order_id: providerOrderId,
    shipping_address: address as unknown as Json,
  };

  const { error: insertError } = await admin.from("orders").insert(orderRow);
  if (insertError) {
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 },
    );
  }

  // Tell the client how to pay: provider name decides mock vs. real modal;
  // keyId is null in mock mode (the client uses the simulate-success path).
  const env = serverEnv();
  return NextResponse.json(
    {
      orderNumber,
      providerOrderId,
      amountPaise: cart.totalPaise,
      providerName: getPaymentProvider().name,
      // Empty string (unset env) normalizes to null; providerName is the signal
      // the client actually uses to choose the mock vs. real pay path.
      keyId: env.RAZORPAY_KEY_ID || null,
    },
    { status: 201 },
  );
}
