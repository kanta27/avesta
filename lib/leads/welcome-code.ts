/**
 * The ONE shared lead-capture discount code.
 *
 * Per the feature-9 spec, the popup reveals a single real shared code — NOT a
 * per-lead code. It is seeded (migration `*_seed_welcome_code.sql`) as a percent
 * code with `per_phone_limit = 1`, so feature 8's existing per-phone enforcement
 * at checkout makes it a first-order-only code with no extra logic here.
 *
 * Kept as a plain constant (not a DB read) because it is fixed and shared — the
 * real enforcement happens at checkout against `discount_codes`.
 */
export const WELCOME_CODE = "WELCOME10";
