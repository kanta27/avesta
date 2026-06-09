# 9 — Lead-capture popup + Leads module + WhatsApp follow-up

**Phase:** 1 · **Depends on:** A2, A3, feature 10 (WhatsApp), Vercel Cron · **Status:** To build

## Purpose
Capture Name/Phone/Email without harming conversion or SEO.

## Build
- `LeadPopup` client component (already stubbed in A1).
- `POST /api/leads`.
- 48h follow-up job (Vercel Cron route).

## Data
Writes `leads` with `source_type='popup'`, `consent_whatsapp`, `consent_at`, `source_page`. The footer newsletter and B2B form (feature 15) and quiz (feature 20) write to the **same** table with their own `source_type`.

## API
- `POST /api/leads` — `{ name, phone, email, consent, source_page, source_type }`. Validates phone (10-digit), stores consent + timestamp, returns the discount code, triggers instant WhatsApp/email with the code.
- `GET /api/cron/lead-followup` — Vercel Cron; finds unconverted `popup` leads ~48h old with no matching paid order, sends **one** reminder, marks them so they're not nudged again.

## UI / triggers
- Fire on **whichever first**: ~10–15s on site **OR** 40–50% scroll **OR** exit intent (desktop cursor-to-top / mobile fast scroll-up) **OR** second page view. **Never on load. Never during checkout.**
- Offer: "Get 10% off your first order." Fields: Name, Phone (10-digit validation), Email.
- **Explicit unticked** WhatsApp consent checkbox (DPDP). Code revealed on submit + sent via WhatsApp/email.
- Dismissible; suppress **7–14 days** via `localStorage`. **Mobile = bottom-sheet**, not center modal.

## Follow-up
Instant WhatsApp with code → if no purchase in 48h, **one** reminder nudge → stop. Match `leads.phone` to `orders.customer_phone` to flip `converted` + set `converted_order_id`.

## Tech notes
- Conversion matching can run in the cron job and/or at order-paid time (set `converted` when a paid order's phone matches an existing lead).
- Don't over-message: exactly one nudge, then never again for that lead.

## Acceptance
- Popup respects all trigger + suppression rules; never on load or during checkout.
- Consent stored with timestamp; lead appears in admin (feature 12); WhatsApp code sent.
- Conversion flag flips when that phone later orders; at most one 48h nudge is sent.
