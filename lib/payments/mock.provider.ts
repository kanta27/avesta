import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
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
 * Mock payment provider. Server-only.
 *
 * Lets checkout, refunds, and tests run locally before real Razorpay test keys
 * exist. No network and no SDK — fully deterministic and in-memory. It mirrors
 * Razorpay's signature scheme (HMAC-SHA256) against a fixed local secret, so a
 * test can compute a valid signature with `mockSign(...)` / `mockWebhookSign(...)`
 * below and exercise the real verification path.
 *
 * Selection guarantees this is never used in production (see `./index` — in
 * production, missing Razorpay keys throw rather than falling back here).
 */

/** Fixed, non-secret signing key used only by the mock. Not a real credential. */
const MOCK_SECRET = "mock_secret_avesta_dev_only";

function hmacHex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function hmacMatches(expectedHex: string, received: string): boolean {
  const expected = Buffer.from(expectedHex, "utf8");
  const actual = Buffer.from(received, "utf8");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

/** Test helper: produce a valid checkout signature the mock will accept. */
export function mockSign(providerOrderId: string, paymentId: string): string {
  return hmacHex(MOCK_SECRET, `${providerOrderId}|${paymentId}`);
}

/** Test helper: produce a valid webhook signature the mock will accept. */
export function mockWebhookSign(rawBody: string): string {
  return hmacHex(MOCK_SECRET, rawBody);
}

export const mockProvider: PaymentProvider = {
  name: "mock",

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    // Deterministic id derived from our order number — traceable in logs/tests.
    return { providerOrderId: `order_mock_${input.orderNumber}` };
  },

  verifySignature(input: VerifySignatureInput): boolean {
    const expected = mockSign(input.providerOrderId, input.paymentId);
    return hmacMatches(expected, input.signature);
  },

  verifyWebhookSignature(input: VerifyWebhookSignatureInput): boolean {
    const expected = mockWebhookSign(input.rawBody);
    return hmacMatches(expected, input.signature);
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    return { refundId: `rfnd_mock_${input.paymentId}` };
  },
};
