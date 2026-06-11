// Lead-capture request validation — pure (zod only), no DB access.
//
// One endpoint (`POST /api/leads`) serves every lead source that lands in the
// shared `leads` table. Today that's the popup, the footer newsletter and the
// B2B inquiry form (feature 15); the quiz (feature 20) will add its own
// source_type later.
//
// The shape requirements differ per source, so this is a discriminated union on
// `source_type`:
//   - popup      → name + phone + email are all required (it's the full offer form).
//   - newsletter → only email is required; name/phone are optional.
//   - b2b        → name + phone + email all required, plus org type / volume /
//                  free-text message (stored in the `quiz_answers` jsonb catch-all).
//
// Phone reuses the SAME normalizer as checkout so a lead's phone compares
// byte-for-byte against `orders.customer_phone` for the conversion flip later.

import { z } from "zod";

import { phoneSchema } from "@/lib/checkout/validation";

/** Required, valid, lowercased email (lowercase keeps dedupe stable). */
const requiredEmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(200)
  .refine((s) => z.email().safeParse(s).success, "Enter a valid email address.")
  .transform((s) => s.toLowerCase());

/** Optional phone: blank/absent → undefined; otherwise must be a valid mobile. */
const optionalPhoneSchema = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  phoneSchema.optional(),
);

/** Shared fields every source carries. */
const baseFields = {
  // DPDP: honest consent flag. The client sends it explicitly; default false so a
  // missing value can never be read as consent.
  consent: z.boolean().default(false),
  // Where the lead was captured, for attribution. Free-form, length-capped.
  source_page: z.string().trim().max(300).optional(),
};

const popupSchema = z.object({
  source_type: z.literal("popup"),
  name: z.string().trim().min(1, "Name is required.").max(120),
  phone: phoneSchema,
  email: requiredEmailSchema,
  ...baseFields,
});

const newsletterSchema = z.object({
  source_type: z.literal("newsletter"),
  name: z.string().trim().max(120).optional(),
  phone: optionalPhoneSchema,
  email: requiredEmailSchema,
  ...baseFields,
});

/** The org types a B2B enquirer can identify as. */
export const B2B_ORG_TYPES = [
  "doctor",
  "pharmacy",
  "distributor",
  "other",
] as const;

const b2bSchema = z.object({
  source_type: z.literal("b2b"),
  name: z.string().trim().min(1, "Name is required.").max(120),
  phone: phoneSchema,
  email: requiredEmailSchema,
  // Who's enquiring — drives how the team follows up. Closed set.
  org_type: z.enum(B2B_ORG_TYPES, { message: "Select your organisation type." }),
  // Expected order volume / interest — free-text, required so the lead is actionable.
  volume: z.string().trim().min(1, "Tell us your expected volume.").max(300),
  // Optional free-text needs. Length-capped; the team reads this verbatim.
  message: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(2000).optional(),
  ),
  ...baseFields,
});

/** The full lead request — discriminated on `source_type`. Unknown keys stripped. */
export const leadRequestSchema = z.discriminatedUnion("source_type", [
  popupSchema,
  newsletterSchema,
  b2bSchema,
]);

/** Parsed, normalized lead request. */
export type LeadRequest = z.infer<typeof leadRequestSchema>;

/** Parsed, normalized B2B inquiry — the `b2b` arm of the union. */
export type B2bLeadRequest = z.infer<typeof b2bSchema>;
