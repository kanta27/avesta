import "server-only";
import { z } from "zod";
import { publicEnv } from "./env";

/**
 * Server-only environment.
 *
 * Holds every secret and server-side config value. The `server-only` import
 * above makes the build fail if this module is ever pulled into client code,
 * so none of these values can leak into the browser bundle.
 *
 * Required vs. optional policy for Foundation A4:
 *   - SUPABASE_SERVICE_ROLE_KEY is REQUIRED for any privileged/server path, but
 *     it is validated lazily (on first access via `serverEnv()`), NOT at app
 *     boot. This lets the public storefront boot and render under RLS with only
 *     the public Supabase vars set, while any code that constructs the
 *     service-role client still fails fast with a clear error if the key is
 *     absent. Fill it in before exercising admin/webhook/order paths.
 *   - Everything else (Razorpay, WhatsApp key, email, automation token) is
 *     OPTIONAL for now and becomes required as each feature lands.
 *
 * Access via `serverEnv()` — never read `process.env` for these directly, so
 * validation and types stay in one place.
 */
const serverSchema = z.object({
  // Supabase service-role key — BYPASSES RLS. Secret. Required for server work.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Razorpay — test keys until go-live (feature A5). Optional until then.
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  // WhatsApp provider selection + key (feature 10). Defaults to interakt.
  WHATSAPP_PROVIDER: z.enum(["interakt", "aisensy"]).default("interakt"),
  WHATSAPP_API_KEY: z.string().optional(),
  // Transactional email (Resend/SES) for receipts. Optional until wired.
  EMAIL_API_KEY: z.string().optional(),
  // Comma-separated allow-list for the admin gate (feature A6).
  ADMIN_ALLOWED_EMAILS: z.string().optional(),
  // Bearer token for the blog-automation endpoint (feature 16).
  AUTOMATION_API_TOKEN: z.string().optional(),
});

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

type ServerEnv = z.infer<typeof serverSchema> & typeof publicEnv;

let cached: ServerEnv | null = null;

/**
 * Validate and return the server environment (public + server vars merged).
 * Throws a clear, aggregated error the first time it is called if a required
 * server var is missing or malformed. Result is cached after the first call.
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER,
    WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY,
    EMAIL_API_KEY: process.env.EMAIL_API_KEY,
    ADMIN_ALLOWED_EMAILS: process.env.ADMIN_ALLOWED_EMAILS,
    AUTOMATION_API_TOKEN: process.env.AUTOMATION_API_TOKEN,
  });

  if (!parsed.success) {
    throw new Error(
      "❌ Invalid server environment variables. Set them in .env.local " +
        "(secrets — never commit them):\n" +
        formatIssues(parsed.error),
    );
  }

  cached = { ...publicEnv, ...parsed.data };
  return cached;
}
