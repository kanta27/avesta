# A5 — Payment abstraction layer

**Phase:** Foundation · **Depends on:** A1, A4 · **Status:** To build

## Purpose
Make swapping payment gateways a one-file change (spec requirement). The app never imports Razorpay directly.

## Build
`/lib/payments/`:

```ts
// /lib/payments/types.ts
export interface PaymentProvider {
  createOrder(input: {
    amountPaise: number;
    orderNumber: string;
    notes?: Record<string, string>;
  }): Promise<{ providerOrderId: string }>;

  verifySignature(input: {
    providerOrderId: string;
    paymentId: string;
    signature: string;
  }): boolean;

  refund(input: {
    paymentId: string;
    amountPaise?: number;
  }): Promise<{ refundId: string }>;
}
```

- `razorpay.provider.ts` — implements `PaymentProvider` using the Razorpay server SDK.
- `index.ts` — exports `getPaymentProvider()` that selects the active provider, plus thin helpers (`createPaymentOrder`, `verifyPayment`, `refundPayment`) that the rest of the app imports. **The app only ever calls these helpers**, never the SDK.

## Tech notes
- `verifySignature` uses HMAC-SHA256 over `providerOrderId|paymentId` with the key secret (Razorpay's standard checkout verification).
- The webhook (feature 5) verifies its own signature with `RAZORPAY_WEBHOOK_SECRET` — keep that logic in the provider too so it's swappable.
- Server-only module; never imported by client components.

## Deps / env
- `razorpay` (server SDK). Env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (test values until go-live).

## Acceptance
- Checkout and refunds call only the `PaymentProvider` interface / helpers.
- Switching providers touches exactly one file (`index.ts` selection + a new `*.provider.ts`); no caller changes.
- A test-mode order can be created and a test refund issued through the interface.
