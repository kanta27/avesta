# A4 — Environment & config

**Phase:** Foundation · **Depends on:** A1 · **Status:** To build

## Purpose
Centralize all secrets and config; make them available locally (`.env.local`) and on Vercel (project env).

## Build
Create `.env.local` and mirror in Vercel project settings:

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RAZORPAY_KEY_ID=            # test keys until go-live
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
WHATSAPP_PROVIDER=interakt  # or aisensy
WHATSAPP_API_KEY=
EMAIL_API_KEY=              # Resend/SES for receipts
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
ADMIN_ALLOWED_EMAILS=       # comma list for admin gate
AUTOMATION_API_TOKEN=       # bearer for blog automation endpoint
```

- Add a typed env loader in `/lib/env.ts` (e.g. Zod-validated) that throws at boot if a required server var is missing. Split public (`NEXT_PUBLIC_*`) from server-only vars so nothing server-only is ever bundled to the client.
- Commit a `.env.example` with empty values; never commit real secrets.

## Tech notes
- `NEXT_PUBLIC_*` vars are inlined into the client bundle — only non-secret values belong there. Everything else (service role, Razorpay secret, webhook secret, WhatsApp/email keys, automation token) is server-only.
- Razorpay uses **test** keys until go-live; swapping to live keys is an env change, not a code change.

## Acceptance
- App boots locally and on Vercel with env set; missing required vars fail fast with a clear error.
- No server-only secret appears in the client bundle (grep the build output for the service-role key → absent).
