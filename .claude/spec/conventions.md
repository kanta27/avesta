# Conventions — guardrails & Definition of Done

These apply to **every** feature spec. Read once; they are not repeated in full inside each doc.

## Guardrails (hard rules)

- **Service-role key is server-only.** Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code. Public reads use the anon key under RLS; all writes go through server route handlers / server actions.
- **Never trust client-sent prices.** Re-price every cart from the DB at checkout. Compute discounts and totals server-side. The client sends item refs (`product_id`, `pack_key`, `qty`), not money.
- **Razorpay test keys until go-live.** Never hardcode secrets; read from env. Use the payment abstraction (`A5`) — never import the Razorpay SDK outside `/lib/payments/`.
- **No destructive SQL without explicit confirmation.** No `drop`, `truncate`, or mass `delete` casually. Prefer reversible, committed migrations.
- **RLS on every table.** Public reads limited to `is_active` / `published` / `is_approved` rows. Writes server-side only.
- **Idempotency** for anything money- or message-related (webhooks dedupe on `razorpay_payment_id`; WhatsApp/email sends are logged and non-fatal on failure).
- **Compliance copy:** structure/function claims only ("supports hydration", "helps maintain immunity") — never therapeutic ("cures", "treats", "prevents disease"). Product-page copy needs Avesthagen sign-off. Footer disclaimer stays: "These products are not intended to diagnose, treat, cure or prevent any disease."
- **Consent (DPDP):** WhatsApp/marketing consent is an explicit **unticked** checkbox; store `consent_whatsapp` + `consent_at` timestamp.

## Money & identifiers

- Store all money as **integer paise** (`*_paise`). Never floats. Format to ₹ only at the display edge.
- `order_number` format: `AV-YYYY-NNNNNN` (e.g. `AV-2026-000123`), generated server-side, unique.
- Customers are **guest-first**, keyed by **phone** (E.164 or 10-digit normalized — pick one and normalize on write).

## Design tokens (from the homepage demo)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0A3D3F` | primary deep teal |
| `--ink-2` | `#0F5557` | secondary teal |
| `--paper` | `#FAFBF8` | base background |
| `--paper-2` | `#F1F5F0` | alt section background |
| `--lime` | `#C8F04C` | electric accent / CTAs |
| `--lime-deep` | `#9CCB1F` | accent text |
| `--amber` | `#E8A24A` | stars / warm secondary |
| `--grey` | `#5C6B68` | body subtext |
| `--line` | `#DDE5DF` | borders |
| `--radius` | `18px` | card radius |

Fonts: Schibsted Grotesk (display, 500/700/800), Instrument Sans (body, 400/500/600), IBM Plex Mono (data/labels). Load via `next/font`.

## Definition of Done (every feature)

A feature is done only when **all** of these pass:

1. **Typechecks** — `tsc --noEmit` clean; uses generated Supabase types (no `any` on DB rows).
2. **Lints** — ESLint clean.
3. **Behavior verified** — Playwright happy-path passes (run it, don't just write it); screenshot attached for UI work.
4. **Migration committed** — any schema change is a reversible SQL migration in the repo, applied via Supabase MCP, types regenerated.
5. **Preview deploy green** — Vercel preview builds and the flow works there.
6. **Guardrails honored** — no service-role leak, no client-trusted prices, RLS intact.

State explicitly which of these were verified vs believed-complete. "Done" means done.
