/**
 * Payment abstraction — the interface every gateway implements.
 *
 * This file is dependency-free and carries no secrets, so it is safe to import
 * from anywhere (the concrete providers and `index.ts` are `server-only`). The
 * rest of the app talks only to the helpers in `./index`, never to a provider
 * or to the Razorpay SDK directly — swapping gateways is a one-file change in
 * `index.ts` plus a new `*.provider.ts`.
 *
 * Money is always integer paise (see conventions.md). `order_number` is the
 * app's `AV-YYYY-NNNNNN` identifier and is passed through to the gateway as the
 * receipt so a provider order can be traced back to ours.
 */

export interface CreateOrderInput {
  /** Charge amount in integer paise (e.g. ₹499.00 → 49900). Never a float. */
  amountPaise: number;
  /** Our order identifier, `AV-YYYY-NNNNNN`. Sent to the gateway as receipt. */
  orderNumber: string;
  /** Optional key/value metadata forwarded to the gateway (all string values). */
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  /** The gateway's order id (e.g. Razorpay `order_...`). Store on our order. */
  providerOrderId: string;
}

export interface VerifySignatureInput {
  /** The gateway order id returned by `createOrder`. */
  providerOrderId: string;
  /** The payment id the client received from the gateway checkout. */
  paymentId: string;
  /** The signature the client received from the gateway checkout. */
  signature: string;
}

export interface VerifyWebhookSignatureInput {
  /** The exact raw request body bytes as a string — NOT a re-serialized object. */
  rawBody: string;
  /** The signature header sent by the gateway with the webhook. */
  signature: string;
}

export interface RefundInput {
  /** The gateway payment id to refund. */
  paymentId: string;
  /** Amount in paise to refund. Omit for a full refund. */
  amountPaise?: number;
}

export interface RefundResult {
  /** The gateway's refund id. */
  refundId: string;
}

/**
 * A swappable payment gateway. Implementations live in `*.provider.ts` and are
 * selected in `index.ts`; callers never reference them directly.
 */
export interface PaymentProvider {
  /** Human-readable provider id, for logging/diagnostics (e.g. "razorpay"). */
  readonly name: string;

  /** Create a gateway order for an amount. */
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;

  /**
   * Verify a checkout callback signature (HMAC over `providerOrderId|paymentId`).
   * Synchronous and pure — returns true only for an authentic signature.
   */
  verifySignature(input: VerifySignatureInput): boolean;

  /**
   * Verify a webhook signature (HMAC over the raw request body with the
   * webhook secret). Kept on the provider so webhook verification is swappable
   * along with the gateway (used by the checkout webhook, feature 5).
   */
  verifyWebhookSignature(input: VerifyWebhookSignatureInput): boolean;

  /** Refund a payment, fully or partially. */
  refund(input: RefundInput): Promise<RefundResult>;
}
