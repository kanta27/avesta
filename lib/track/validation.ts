// Track-lookup request validation — pure (zod only), no DB access.
//
// SECURITY: the (orderNumber, phone) pair is the authz check for reading an
// order as a guest. Phone is normalized through the SAME transform as checkout
// so it compares byte-for-byte against the stored `customer_phone`; the order
// number is trimmed + uppercased to match the canonical `AV-YYYY-NNNNNN` form.
//
// Shape failures here are folded into the route's UNIFORM "not found" response
// (never a distinct error), so a malformed number reveals nothing that a
// well-formed-but-nonexistent number wouldn't — there is no enumeration oracle.

import { z } from "zod";

import { phoneSchema } from "@/lib/checkout/validation";

/** Canonical order number, e.g. `AV-2026-000123`. Trimmed + uppercased on read. */
const orderNumberSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .transform((s) => s.toUpperCase());

export const trackRequestSchema = z.object({
  orderNumber: orderNumberSchema,
  phone: phoneSchema,
});

export type TrackRequest = z.infer<typeof trackRequestSchema>;
