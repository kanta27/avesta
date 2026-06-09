# Deploy-day checklist

A running list of things to verify/do **before and during a production (or preview)
deploy** to Vercel. Add items here as features land deferred work; check them off
when done. This is not a one-time doc — keep it current.

## Environment

- [ ] **Mirror env vars into Vercel** → Project → Settings → Environment Variables.
      `.env.local` is local-only and never committed, so these must be set in Vercel
      independently. As of Foundation A4:

      | Variable | Scope | Notes |
      |---|---|---|
      | `NEXT_PUBLIC_SITE_URL` | Public | Set to the deployed origin (e.g. `https://avestahealth.in`), **not** localhost. |
      | `NEXT_PUBLIC_SUPABASE_URL` | Public | `https://jukiolxmsmtfaefeoyah.supabase.co` |
      | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | The `sb_publishable_…` key. |
      | `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Use the `sb_secret_…` value. Server-only — set it as a secret/encrypted env var, never `NEXT_PUBLIC_*`. |
      | `WHATSAPP_PROVIDER` | Server | `interakt` (or `aisensy`). |
      | `AUTOMATION_API_TOKEN` | **Secret** | Bearer for the blog-automation endpoint. |

      Add the rest (`RAZORPAY_*`, `WHATSAPP_API_KEY`, `EMAIL_API_KEY`,
      `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `ADMIN_ALLOWED_EMAILS`) as
      each feature ships — see `.env.example` for the full list.

- [ ] **Confirm the service-role key is NOT in the client bundle.** After a
      production build, grep the client output for the secret — it must be absent.

      ```bash
      npm run build
      # PowerShell:
      Select-String -Path ".next/static/**/*.js" -Pattern "sb_secret_" -SimpleMatch
      # bash:
      grep -rF "sb_secret_" .next/static && echo "LEAK!" || echo "clean — no service-role key in client bundle"
      ```

      Expect **no matches** in `.next/static` (the client bundle). The structural
      guarantee is the `server-only` import in `lib/env.server.ts` and
      `lib/supabase/admin.ts`; this grep confirms it at build time.

## Build & preview

- [ ] `npm run build` succeeds locally.
- [ ] Vercel preview deploy is green and the changed flow works there.

## Per-feature gates (fill in as features land)

- [ ] _A5 payments_ — Razorpay live keys swapped in (env change, not code); webhook secret set.
- [ ] _Feature 10 WhatsApp_ — provider API key set; sends logged and non-fatal.
