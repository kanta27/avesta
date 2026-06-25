// Customer auth + profile validation — pure (zod only), no DB access.
//
// Shared trust boundary for the storefront signup/login server actions and the
// account profile editor. Phone reuses the canonical checkout normalizer so a
// number saved on the profile matches the one used as the `customers.phone` key
// at checkout.

import { z } from "zod";
import { phoneSchema } from "@/lib/checkout/validation";

/**
 * Account password. Min 8 for a sane floor; max 72 because bcrypt (Supabase
 * Auth's hash) silently truncates input beyond 72 bytes — rejecting longer
 * input avoids a confusing "works with the first 72 chars" footgun.
 */
const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

const nameSchema = z.string().trim().min(1, "Name is required.").max(120);

/** Optional phone — "" is treated as absent; any value must be a valid mobile. */
const optionalPhoneSchema = z
  .string()
  .trim()
  .transform((s) => (s === "" ? undefined : s))
  .optional()
  .pipe(phoneSchema.optional());

/** Sign up a new storefront customer. */
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

/** Log in an existing customer (or admin — same shape). */
export const loginSchema = z.object({
  email: emailSchema,
  // Login does NOT enforce the min/max policy — it only has to match whatever
  // was set. A non-empty string is enough; the real check is the password match.
  password: z.string().min(1, "Enter your password."),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Optional saved-address block on the profile. All-or-nothing on the core fields. */
const profileAddressSchema = z.object({
  line1: z.string().trim().max(200).optional().default(""),
  line2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  state: z.string().trim().max(120).optional().default(""),
  pincode: z.string().trim().max(10).optional().default(""),
  country: z.string().trim().max(120).optional().default("India"),
});

/** Edit the account profile (name, phone, saved address, WhatsApp consent). */
export const profileUpdateSchema = z.object({
  name: nameSchema,
  phone: optionalPhoneSchema,
  address: profileAddressSchema,
  consentWhatsapp: z.boolean().default(false),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/** Change password (account settings). */
export const changePasswordSchema = z.object({
  password: passwordSchema,
});
