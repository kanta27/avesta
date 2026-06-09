# Avesthagen D2C — Feature Spec Library

Build-ready engineering specs, one document per feature. Each spec is self-contained and can be handed to Claude Code one block at a time.

**Stack (locked):** Next.js 16 (App Router) + TypeScript + Tailwind · Supabase (Postgres + Auth + Storage) · Razorpay behind an abstraction layer · WhatsApp via Interakt/AiSensy · Hosting on Vercel.

**Design:** keep the existing homepage demo as the visual source of truth (deep teal `#0A3D3F` + electric-lime `#C8F04C`; Schibsted Grotesk display / Instrument Sans body / IBM Plex Mono data). It is ported to components in Foundation **A1**.

---

## How to read a spec

Every feature doc uses the same template:

- **Purpose** — what it's for.
- **Depends on** — features/foundation that must exist first.
- **Build** — pages, components, modules to create.
- **Data** — tables/columns it reads or writes (full schema lives in [`foundation/A2-data-model.md`](foundation/A2-data-model.md)).
- **API** — route handlers / server actions with signatures.
- **UI** — screens and behavior.
- **Tech notes** — libraries, patterns, gotchas.
- **Deps / env** — packages and environment variables.
- **Acceptance** — done = all checks pass.

Read [`conventions.md`](conventions.md) once — it holds the guardrails and Definition of Done that apply to **every** feature. Read [`claude-code-setup.md`](claude-code-setup.md) for the MCP/plugin setup and the per-feature working loop.

---

## Current status

| Item | Status |
|---|---|
| Homepage **visual design** | Done (static HTML demo, `avesthagen_d2c_homepage.html`) |
| Everything else (app, DB, checkout, admin, automations) | **To build** |

The specs below are effectively the entire functional product.

---

## Index

### Foundation (build first — nothing else works until these exist)
| ID | Feature | File |
|---|---|---|
| A1 | Project scaffold & component port | [foundation/A1-scaffold-and-component-port.md](foundation/A1-scaffold-and-component-port.md) |
| A2 | Data model (full schema) | [foundation/A2-data-model.md](foundation/A2-data-model.md) |
| A3 | Row-Level Security & storage | [foundation/A3-rls-and-storage.md](foundation/A3-rls-and-storage.md) |
| A4 | Environment & config | [foundation/A4-environment-and-config.md](foundation/A4-environment-and-config.md) |
| A5 | Payment abstraction layer | [foundation/A5-payment-abstraction-layer.md](foundation/A5-payment-abstraction-layer.md) |
| A6 | Admin auth | [foundation/A6-admin-auth.md](foundation/A6-admin-auth.md) |

### Phase 1
| # | Feature | File |
|---|---|---|
| 1 | Product catalog & Shop | [phase-1/01-product-catalog-shop.md](phase-1/01-product-catalog-shop.md) |
| 2 | Product Detail Page (PDP) | [phase-1/02-product-detail-page.md](phase-1/02-product-detail-page.md) |
| 3 | Bundles / Packs page | [phase-1/03-bundles-packs.md](phase-1/03-bundles-packs.md) |
| 4 | Cart | [phase-1/04-cart.md](phase-1/04-cart.md) |
| 5 | Single-page checkout + Razorpay + webhook | [phase-1/05-checkout-razorpay-webhook.md](phase-1/05-checkout-razorpay-webhook.md) |
| 6 | Order confirmation + receipt | [phase-1/06-order-confirmation-receipt.md](phase-1/06-order-confirmation-receipt.md) |
| 7 | Track Order / lightweight account | [phase-1/07-track-order-account.md](phase-1/07-track-order-account.md) |
| 8 | Discount-code engine | [phase-1/08-discount-code-engine.md](phase-1/08-discount-code-engine.md) |
| 9 | Lead-capture popup + Leads + WhatsApp follow-up | [phase-1/09-lead-capture-popup.md](phase-1/09-lead-capture-popup.md) |
| 10 | WhatsApp order notifications | [phase-1/10-whatsapp-notifications.md](phase-1/10-whatsapp-notifications.md) |
| 11 | Policy pages | [phase-1/11-policy-pages.md](phase-1/11-policy-pages.md) |
| 12 | Admin panel core | [phase-1/12-admin-panel-core.md](phase-1/12-admin-panel-core.md) |
| 13 | Analytics dashboard (in-admin) | [phase-1/13-analytics-dashboard.md](phase-1/13-analytics-dashboard.md) |
| 14 | SEO baseline + structured data | [phase-1/14-seo-baseline.md](phase-1/14-seo-baseline.md) |
| 15 | B2B bulk-inquiry page | [phase-1/15-b2b-bulk-inquiry.md](phase-1/15-b2b-bulk-inquiry.md) |

### Phase 2
| # | Feature | File |
|---|---|---|
| 16 | Blog + admin editor + automation endpoint | [phase-2/16-blog-automation.md](phase-2/16-blog-automation.md) |
| 17 | Reviews engine + post-delivery requests | [phase-2/17-reviews-engine.md](phase-2/17-reviews-engine.md) |
| 18 | Abandoned-cart WhatsApp recovery | [phase-2/18-abandoned-cart-recovery.md](phase-2/18-abandoned-cart-recovery.md) |
| 19 | Concern-based SEO landing pages | [phase-2/19-concern-seo-pages.md](phase-2/19-concern-seo-pages.md) |
| 20 | 60-second health quiz | [phase-2/20-health-quiz.md](phase-2/20-health-quiz.md) |
| 21 | Gallery management + public gallery | [phase-2/21-gallery-management.md](phase-2/21-gallery-management.md) |
| 22 | Analytics / pixel layer | [phase-2/22-analytics-pixel-layer.md](phase-2/22-analytics-pixel-layer.md) |

### Phase 3
| # | Feature | File |
|---|---|---|
| 23 | Subscriptions (Razorpay recurring) | [phase-3/23-subscriptions.md](phase-3/23-subscriptions.md) |
| 24 | Shiprocket API integration | [phase-3/24-shiprocket.md](phase-3/24-shiprocket.md) |
| 25 | B2B tiered pricing / portal | [phase-3/25-b2b-tiered-pricing.md](phase-3/25-b2b-tiered-pricing.md) |
| 26 | Regional language (i18n) | [phase-3/26-i18n.md](phase-3/26-i18n.md) |

---

## Build order (do not start a feature before its deps exist)

Full actionable checklist with links and check-off boxes: [`build-order-checklist.md`](build-order-checklist.md) (Part F). Summary:

1. **Foundation:** A1 scaffold + component port → A2 schema → A3 RLS/storage → A4 env → A5 payments → A6 admin auth.
2. **Commerce spine:** 1 catalog → 2 PDP → 4 cart → 5 checkout/webhook → 6 confirmation → 8 discounts.
3. **Ops:** 12 admin (Products/Orders/Discounts/Leads) → 10 WhatsApp notifications → 7 track order → 11 policies.
4. **Growth-ready:** 9 lead popup + follow-up → 13 analytics → 14 SEO → 15 B2B → 3 bundles.
5. **Phase 2:** 16 blog+automation → 17 reviews → 18 abandoned-cart → 19 concern pages → 20 quiz → 21 gallery → 22 pixels.
6. **Phase 3:** 23 subscriptions (apply to Razorpay early) → 24 Shiprocket → 25 B2B pricing → 26 i18n.

## Line up in parallel with the build
Final SKU list (names, prices, pack-tier pricing, FSSAI numbers) · brand assets (logos, product/lab photos, reels) · Avesthagen claims sign-off process · Razorpay onboarding (+ early recurring application) · WhatsApp Business API account (Interakt/AiSensy).
