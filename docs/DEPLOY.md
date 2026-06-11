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
      | `CRON_SECRET` | **Secret** | **(Feature 9)** Bearer protecting `/api/cron/*`. Vercel Cron sends it automatically as `Authorization: Bearer $CRON_SECRET`. If unset, the cron route returns 503 (fails closed). Generate a long random value. |

      | `ADMIN_ALLOWED_EMAILS` | Server | **(A6)** Comma-separated allow-list of admin emails. Server-only (not `NEXT_PUBLIC_*`). The admin gate denies everyone if this is empty/unset. |

      Add the rest (`RAZORPAY_*`, `WHATSAPP_API_KEY`, `EMAIL_API_KEY`,
      `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`) as each feature ships —
      see `.env.example` for the full list.

- [ ] **Feature 14 (SEO) depends on a correct production `NEXT_PUBLIC_SITE_URL`.**
      Canonical tags, OpenGraph/Twitter URLs, the Organization/Product JSON-LD
      `url`/`logo`, and the absolute `<loc>` entries in `/sitemap.xml` plus the
      `Sitemap:` line in `/robots.txt` are all built from `NEXT_PUBLIC_SITE_URL`.
      It is inlined at **build time**, so until it is set to the real deployed
      origin in Vercel (and the project redeployed), every one of these emits
      `http://localhost:3000` and is wrong for search engines. Set it per
      environment (Production = the prod domain; Preview deploys shouldn't be
      indexed, so pointing them at the prod origin is fine) and redeploy.

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

## Admin auth (A6 — magic link)

- [ ] **Configure Supabase Auth redirect URLs.** Supabase Dashboard → Authentication
      → URL Configuration:
      - **Site URL** = the deployed origin (e.g. `https://avestahealth.in`).
      - **Redirect URLs** (allow-list) must include the callback for every origin
        you sign in from:
        - `http://localhost:3000/admin/auth/callback` (local dev)
        - `https://<your-preview-or-prod-domain>/admin/auth/callback`

        The magic link's `emailRedirectTo` is built from `NEXT_PUBLIC_SITE_URL`
        (`/admin/auth/callback`), so that URL must be allow-listed here or the
        link will be rejected by Supabase.

- [ ] **Set up custom SMTP for production magic-link email.** Supabase's built-in
      email sender is **rate-limited (a few messages/hour) and meant for testing
      only** — it will silently throttle real admin sign-ins. Before go-live,
      Supabase Dashboard → Authentication → Emails → SMTP Settings: plug in a
      transactional provider (Resend / SES / Postmark / etc.) with a verified
      sender domain. Optionally customise the "Magic Link" email template.

- [ ] **(Follow-up, not yet built) Switch the magic link to the token-hash verify
      flow for robustness.** The current callback uses the PKCE `?code=` exchange
      (`exchangeCodeForSession`), which stores a one-time `code_verifier` cookie and
      therefore **fails if the link is opened in a different browser than it was
      requested from, or if an email prefetcher/security scanner (Gmail, corporate
      mail gateways) hits the link and consumes the one-time code first**. The
      callback already degrades gracefully (redirects to `/admin/login?error=1`
      with a "request a new link" message), so this is optional hardening — do it
      if prefetch-consumption shows up in production.

      The fix is the **token-hash flow**, which is tolerant of any browser/prefetcher:
      - Change the email link template to point at a confirm route with
        `token_hash` + `type=email` (e.g. `/admin/auth/confirm?token_hash={{ .TokenHash }}&type=email`)
        instead of the `?code=` link. Configured in Supabase → Authentication →
        Emails → Magic Link template (and `signInWithOtp`'s `emailRedirectTo`).
      - Add an `app/admin/auth/confirm/route.ts` handler that calls
        `supabase.auth.verifyOtp({ type: 'email', token_hash })`, then re-checks the
        allow-list exactly as the current callback does, and redirects to `/admin`.
      - Keep the existing `?code=` callback or retire it once the template is switched.

- [ ] **Set `ADMIN_ALLOWED_EMAILS`** in Vercel (and confirm it's in `.env.local`
      for dev). Without it, the gate denies everyone (fails closed). Comma-separate
      multiple admins.

- [ ] **Verify the gate after deploy:** logged-out `/admin` → redirects to
      `/admin/login`; a non-allow-listed email is denied; an allow-listed email
      reaches the dashboard.

## Cron jobs (feature 9 — lead follow-up)

> **The schedule is NOT wired automatically — it is deploy config you must add.**
> The route + logic ship in the repo (`app/api/cron/lead-followup/route.ts`), but
> Vercel only runs it on a schedule once the cron is declared in project config
> and a deploy picks it up.

- [ ] **Set `CRON_SECRET`** in Vercel (Secret scope) — see the env table above.
      The route returns **503** until it is set, and **401** for any request whose
      bearer doesn't match, so it is never publicly invocable.

- [ ] **Declare the cron schedule.** Add it to the Vercel project config so the
      `/api/cron/lead-followup` route fires automatically. The route is idempotent
      (claims each lead before sending, sends at most one nudge), so the cadence
      only affects how promptly a 48h-old lead is nudged — **once daily** is plenty:

      ```json
      // vercel.json (or the crons[] array in vercel.ts)
      {
        "crons": [
          { "path": "/api/cron/lead-followup", "schedule": "0 4 * * *" }
        ]
      }
      ```

      Vercel automatically attaches `Authorization: Bearer $CRON_SECRET` to cron
      invocations, which is exactly what the route checks. `0 4 * * *` = 04:00 UTC
      daily (off-peak for IST). Adjust as desired.

- [ ] **Verify after deploy:** `GET /api/cron/lead-followup` **without** the bearer
      → 401/503 (rejected); the scheduled run (or a manual call **with** the bearer)
      returns `{ scanned, nudged, reconciled }` and a nudged lead's `followup_sent_at`
      is stamped so it is never nudged again.

## Per-feature gates (fill in as features land)

- [ ] _A5 payments_ — Razorpay live keys swapped in (env change, not code); webhook secret set.
- [ ] _Feature 10 WhatsApp_ — provider API key set; sends logged and non-fatal.
- [ ] _Feature 9 lead follow-up_ — `CRON_SECRET` set; cron schedule declared (above); route rejects unauthenticated calls.

## Feature 11 — policy pages, client inputs needed

The five legal pages (`/shipping`, `/privacy`, `/terms`, `/refund`, `/grievance`) ship
with every client-supplied value rendered as a clearly-marked `[[ … ]]` placeholder —
**none are invented.** Before go-live, get these confirmed by Avesthagen / legal and
replace each placeholder. Search `app/(content)/**` for `<Ph>` to find them all.

- [ ] **Registered legal entity name** + **registered office address** — shipping, privacy, terms, grievance.
- [ ] **Support email** — all five pages.
- [ ] **Grievance officer**: name, email, phone — grievance (also referenced from privacy/terms).
- [ ] **Shipping**: dispatch / handling time, delivery timeline, serviceable regions / pin-code coverage, free-shipping threshold / shipping charge.
- [ ] **Governing-law jurisdiction / city** — terms.
- [ ] **Privacy retention periods**: lead-data retention period, order-record retention period.
- [ ] **Refund**: claim response time, refund processing time.
- [ ] **Grievance SLAs**: acknowledgement SLA, resolution SLA.
- [ ] **Free-shipping threshold (₹999)** — the homepage `AnnouncementBar` currently states
      "FREE SHIPPING ON ORDERS ABOVE ₹999", likely a demo value. Confirm the real threshold
      and apply the **same** number to both the announcement bar
      (`components/store/AnnouncementBar`) and the shipping-policy placeholder above, so the
      bar and the policy never disagree.
