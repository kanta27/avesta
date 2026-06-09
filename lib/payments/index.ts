import "server-only";
import { serverEnv } from "@/lib/env.server";
import { mockProvider } from "./mock.provider";
import { razorpayProvider } from "./razorpay.provider";
import type {
  CreateOrderInput,
  CreateOrderResult,
  PaymentProvider,
  RefundInput,
  RefundResult,
  VerifySignatureInput,
  VerifyWebhookSignatureInput,
} from "./types";

/**
 * Payment facade. Server-only.
 *
 * This is the single seam the rest of the app imports — callers use the helpers
 * below and never touch a provider file or the Razorpay SDK. Swapping gateways
 * is a one-file change: add a `*.provider.ts` and point `getPaymentProvider()`
 * at it.
 *
 * Selection (Option A + production guard):
 *   - If Razorpay keys are present → Razorpay.
 *   - Else in dev/test → the mock provider (so checkout/refunds run locally
 *     before real test keys exist).
 *   - Else in production → THROW. Production must never silently fall back to
 *     the mock; a missing key is a misconfiguration, not a degraded mode.
 */

export type {
  CreateOrderInput,
  CreateOrderResult,
  PaymentProvider,
  RefundInput,
  RefundResult,
  VerifySignatureInput,
  VerifyWebhookSignatureInput,
} from "./types";

export function getPaymentProvider(): PaymentProvider {
  const env = serverEnv();
  const hasRazorpayKeys = Boolean(
    env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET,
  );

  if (hasRazorpayKeys) return razorpayProvider;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No payment provider configured in production: RAZORPAY_KEY_ID / " +
        "RAZORPAY_KEY_SECRET are missing. The mock provider is never used in " +
        "production — set the Razorpay keys in the environment.",
    );
  }

  return mockProvider;
}

// --- Thin helpers the app imports (never a provider or the SDK directly) ---

export function createPaymentOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  return getPaymentProvider().createOrder(input);
}

export function verifyPayment(input: VerifySignatureInput): boolean {
  return getPaymentProvider().verifySignature(input);
}

export function verifyWebhookSignature(
  input: VerifyWebhookSignatureInput,
): boolean {
  return getPaymentProvider().verifyWebhookSignature(input);
}

export function refundPayment(input: RefundInput): Promise<RefundResult> {
  return getPaymentProvider().refund(input);
}
