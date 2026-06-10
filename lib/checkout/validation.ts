// Checkout request validation — pure, dependency-light (zod only), no DB access.
//
// SECURITY: this is the trust boundary for the create-order route. The client
// sends item REFERENCES and address/customer fields ONLY — never money. zod
// strips unknown keys on parse, so a forged `price_paise` / `unit_price_paise`
// smuggled into a line is dropped here before the re-pricer ever runs (and the
// re-pricer reads only product_id/pack_key/qty regardless). Phone and pincode
// are normalized to canonical form so downstream code and the `customers` unique
// phone key stay consistent.

import { z } from "zod";

/** Indian 6-digit pincode (cannot start with 0). */
const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode.");

/**
 * Indian 10-digit mobile, normalized. Accepts common prefixes (+91, 0, spaces,
 * dashes) and reduces to the bare 10 digits; rejects anything that isn't a
 * valid mobile (must start 6–9). The normalized value is what we store, so the
 * `customers.phone` unique key is stable regardless of how it was typed.
 */
const phoneSchema = z
  .string()
  .trim()
  .transform((raw) => {
    let d = raw.replace(/\D/g, "");
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    return d;
  })
  .refine((d) => /^[6-9]\d{9}$/.test(d), "Enter a valid 10-digit mobile number.");

/** Optional email — guest checkout doesn't require it; "" is treated as absent. */
const optionalEmailSchema = z
  .string()
  .trim()
  .max(200)
  .transform((s) => (s === "" ? undefined : s))
  .optional()
  .refine(
    (s) => s === undefined || z.email().safeParse(s).success,
    "Enter a valid email address.",
  );

const addressSchema = z.object({
  line1: z.string().trim().min(1, "Address line 1 is required.").max(200),
  line2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(1, "City is required.").max(120),
  state: z.string().trim().min(1, "State is required.").max(120),
  pincode: pincodeSchema,
  country: z.string().trim().max(120).optional().default("India"),
});

/** A product line: product + chosen pack tier + quantity. Refs only. */
const productLineSchema = z.object({
  kind: z.literal("product"),
  product_id: z.uuid(),
  pack_key: z.string().trim().min(1).max(20),
  qty: z.number().int().min(1).max(99),
});

/** A bundle line: a fixed bundle + quantity. Refs only. */
const bundleLineSchema = z.object({
  kind: z.literal("bundle"),
  bundle_id: z.uuid(),
  qty: z.number().int().min(1).max(99),
});

const lineSchema = z.discriminatedUnion("kind", [
  productLineSchema,
  bundleLineSchema,
]);

/**
 * The full create-order request body. Unknown keys are stripped (zod default),
 * which is the first line of defense for the tamper test — a client-injected
 * price never survives parsing.
 */
export const checkoutRequestSchema = z.object({
  items: z.array(lineSchema).min(1, "Your cart is empty.").max(50),
  customer: z.object({
    name: z.string().trim().min(1, "Name is required.").max(120),
    phone: phoneSchema,
    email: optionalEmailSchema,
  }),
  address: addressSchema,
  // Recorded only; NO discount logic applies yet (feature 8). See the re-pricer.
  discountCode: z.string().trim().max(40).optional(),
});

/** Parsed, normalized create-order request. */
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CheckoutAddress = CheckoutRequest["address"];
export type CheckoutLine = CheckoutRequest["items"][number];
