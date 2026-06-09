# Part F — Build-order checklist

The dependency-respecting order to build the product. **Do not start a feature before the items it depends on exist.** Each line links to its spec; check it off only when its Definition of Done ([`conventions.md`](conventions.md)) passes.

---

## 1. Foundation (build first — nothing else works until these exist)

- [ ] **A1** — Project scaffold + component port · [foundation/A1-scaffold-and-component-port.md](foundation/A1-scaffold-and-component-port.md)
- [ ] **A2** — Data model (full schema migration) · [foundation/A2-data-model.md](foundation/A2-data-model.md)
- [ ] **A3** — RLS + storage buckets · [foundation/A3-rls-and-storage.md](foundation/A3-rls-and-storage.md)
- [ ] **A4** — Environment & config · [foundation/A4-environment-and-config.md](foundation/A4-environment-and-config.md)
- [ ] **A5** — Payment abstraction layer · [foundation/A5-payment-abstraction-layer.md](foundation/A5-payment-abstraction-layer.md)
- [ ] **A6** — Admin auth · [foundation/A6-admin-auth.md](foundation/A6-admin-auth.md)

## 2. Commerce spine

- [ ] **1** — Product catalog & Shop · [phase-1/01-product-catalog-shop.md](phase-1/01-product-catalog-shop.md)
- [ ] **2** — Product Detail Page (PDP) · [phase-1/02-product-detail-page.md](phase-1/02-product-detail-page.md)
- [ ] **4** — Cart · [phase-1/04-cart.md](phase-1/04-cart.md)
- [ ] **5** — Checkout + Razorpay + webhook · [phase-1/05-checkout-razorpay-webhook.md](phase-1/05-checkout-razorpay-webhook.md)
- [ ] **6** — Order confirmation + receipt · [phase-1/06-order-confirmation-receipt.md](phase-1/06-order-confirmation-receipt.md)
- [ ] **8** — Discount-code engine · [phase-1/08-discount-code-engine.md](phase-1/08-discount-code-engine.md)

## 3. Ops

- [ ] **12** — Admin panel core (Products/Orders/Discounts/Leads) · [phase-1/12-admin-panel-core.md](phase-1/12-admin-panel-core.md)
- [ ] **10** — WhatsApp order notifications · [phase-1/10-whatsapp-notifications.md](phase-1/10-whatsapp-notifications.md)
- [ ] **7** — Track Order / lightweight account · [phase-1/07-track-order-account.md](phase-1/07-track-order-account.md)
- [ ] **11** — Policy pages · [phase-1/11-policy-pages.md](phase-1/11-policy-pages.md)

## 4. Growth-ready

- [ ] **9** — Lead-capture popup + follow-up · [phase-1/09-lead-capture-popup.md](phase-1/09-lead-capture-popup.md)
- [ ] **13** — Analytics dashboard (in-admin) · [phase-1/13-analytics-dashboard.md](phase-1/13-analytics-dashboard.md)
- [ ] **14** — SEO baseline + structured data · [phase-1/14-seo-baseline.md](phase-1/14-seo-baseline.md)
- [ ] **15** — B2B bulk-inquiry page · [phase-1/15-b2b-bulk-inquiry.md](phase-1/15-b2b-bulk-inquiry.md)
- [ ] **3** — Bundles / Packs page · [phase-1/03-bundles-packs.md](phase-1/03-bundles-packs.md)

## 5. Phase 2

- [ ] **16** — Blog + automation endpoint · [phase-2/16-blog-automation.md](phase-2/16-blog-automation.md)
- [ ] **17** — Reviews engine + post-delivery requests · [phase-2/17-reviews-engine.md](phase-2/17-reviews-engine.md)
- [ ] **18** — Abandoned-cart WhatsApp recovery · [phase-2/18-abandoned-cart-recovery.md](phase-2/18-abandoned-cart-recovery.md)
- [ ] **19** — Concern-based SEO landing pages · [phase-2/19-concern-seo-pages.md](phase-2/19-concern-seo-pages.md)
- [ ] **20** — 60-second health quiz · [phase-2/20-health-quiz.md](phase-2/20-health-quiz.md)
- [ ] **21** — Gallery management + public gallery · [phase-2/21-gallery-management.md](phase-2/21-gallery-management.md)
- [ ] **22** — Analytics / pixel layer · [phase-2/22-analytics-pixel-layer.md](phase-2/22-analytics-pixel-layer.md)

## 6. Phase 3

- [ ] **23** — Subscriptions (apply to Razorpay recurring **early** — lead time) · [phase-3/23-subscriptions.md](phase-3/23-subscriptions.md)
- [ ] **24** — Shiprocket API integration · [phase-3/24-shiprocket.md](phase-3/24-shiprocket.md)
- [ ] **25** — B2B tiered pricing / portal · [phase-3/25-b2b-tiered-pricing.md](phase-3/25-b2b-tiered-pricing.md)
- [ ] **26** — Regional language (i18n) · [phase-3/26-i18n.md](phase-3/26-i18n.md)

---

## Line up in parallel with the build (not code — procurement / approvals)

These have external lead time; start them now so they don't block launch:

- [ ] **Final SKU list** — names, prices, pack-tier pricing, FSSAI numbers.
- [ ] **Brand assets** — logos, product/lab photos, reels.
- [ ] **Avesthagen claims sign-off process** — who approves product-page copy, and how fast.
- [ ] **Razorpay onboarding** — account live + **early application for recurring/subscriptions** (feature 23).
- [ ] **WhatsApp Business API account** — Interakt or AiSensy, with approved message templates (features 9, 10, 17, 18).
