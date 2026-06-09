import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { serverEnv } from "@/lib/env.server";
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
 * Razorpay implementation of `PaymentProvider`. Server-only.
 *
 * This is the ONLY module in the app allowed to import the Razorpay SDK
 * (guardrail, conventions.md). Everything else goes through the helpers in
 * `./index`. Keys are read from the validated server env at call time and are
 * optional until Razorpay is onboarded — so we fail with a clear, specific
 * error the moment a Razorpay call is attempted without keys, rather than at
 * import/boot. Signature verification is implemented directly with Node crypto
 * (HMAC-SHA256) rather than an SDK helper, so the verification logic is
 * explicit and travels with this provider.
 */

/** Resolve Razorpay credentials or throw a clear, actionable error. */
function getCredentials(): { keyId: string; keySecret: string } {
  const env = serverEnv();
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is selected but RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not " +
        "set. Add test keys to .env.local (or use the mock provider in dev).",
    );
  }
  return { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET };
}

/** Resolve the webhook secret or throw a clear, actionable error. */
function getWebhookSecret(): string {
  const env = serverEnv();
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error(
      "RAZORPAY_WEBHOOK_SECRET is not set — cannot verify the Razorpay webhook " +
        "signature. Add it to .env.local before handling live webhooks.",
    );
  }
  return env.RAZORPAY_WEBHOOK_SECRET;
}

/** Constant-time comparison of a computed hex HMAC against a received signature. */
function hmacMatches(expectedHex: string, received: string): boolean {
  const expected = Buffer.from(expectedHex, "utf8");
  const actual = Buffer.from(received, "utf8");
  // timingSafeEqual throws on length mismatch; an unequal length is already a
  // non-match, so guard explicitly and keep the comparison constant-time.
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

let client: Razorpay | null = null;

/** Lazily construct and cache the SDK client. */
function getClient(): Razorpay {
  if (client) return client;
  const { keyId, keySecret } = getCredentials();
  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

export const razorpayProvider: PaymentProvider = {
  name: "razorpay",

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const order = await getClient().orders.create({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.orderNumber,
      notes: input.notes,
    });
    return { providerOrderId: String(order.id) };
  },

  verifySignature(input: VerifySignatureInput): boolean {
    const { keySecret } = getCredentials();
    // Razorpay's checkout verification: HMAC-SHA256 of `order_id|payment_id`.
    const expected = createHmac("sha256", keySecret)
      .update(`${input.providerOrderId}|${input.paymentId}`)
      .digest("hex");
    return hmacMatches(expected, input.signature);
  },

  verifyWebhookSignature(input: VerifyWebhookSignatureInput): boolean {
    const secret = getWebhookSecret();
    // Razorpay webhook verification: HMAC-SHA256 of the raw request body.
    const expected = createHmac("sha256", secret)
      .update(input.rawBody)
      .digest("hex");
    return hmacMatches(expected, input.signature);
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    const refund = await getClient().payments.refund(input.paymentId, {
      // Razorpay treats an omitted amount as a full refund.
      amount: input.amountPaise,
    });
    return { refundId: String(refund.id) };
  },
};
