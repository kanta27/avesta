import { NextResponse } from "next/server";
import { z } from "zod";

import { getPaymentProvider } from "@/lib/payments";
import { mockSign } from "@/lib/payments/mock.provider";

export const runtime = "nodejs";

/**
 * POST /api/checkout/mock-pay  — DEV / TEST ONLY
 *
 * There is no real Razorpay modal in mock mode, so this stands in for the
 * gateway: it returns a captured `paymentId` + a valid `signature` (via the
 * mock's `mockSign`, which mirrors Razorpay's HMAC scheme). The client then
 * posts those to `/api/checkout/confirm`, exercising the SAME real verification
 * path a live payment would.
 *
 * It is hard-guarded so it can never simulate a payment in production or when a
 * real gateway is active: production short-circuits to 404, and any non-mock
 * provider 404s too. When Razorpay keys are added, this endpoint goes dark and
 * the client uses the real modal instead.
 */
const schema = z.object({
  providerOrderId: z.string().min(1).max(120),
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // If a real provider is configured (Razorpay keys present), there is nothing
  // to simulate — the client should use the real modal. getPaymentProvider()
  // can also throw in a misconfigured prod; treat any non-mock as "not here".
  let providerName: string;
  try {
    providerName = getPaymentProvider().name;
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (providerName !== "mock") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { providerOrderId } = parsed.data;
  // Deterministic fake payment id derived from the order id — stable across
  // retries and easy to correlate in logs/tests (order_mock_… → pay_mock_…).
  const paymentId = providerOrderId.replace(/^order_/, "pay_");
  const signature = mockSign(providerOrderId, paymentId);

  return NextResponse.json({ paymentId, signature });
}
