-- =============================================================================
-- Feature 9 — track the single 48h follow-up nudge per lead
-- Spec: .claude/spec/phase-1/09-lead-capture-popup.md
--
-- The cron job sends EXACTLY ONE reminder to an unconverted popup lead ~48h old,
-- then must never nudge it again. We need a durable marker for "already nudged"
-- so re-runs (and Vercel Cron retries) can't double-message. `converted` /
-- `converted_order_id` already exist (A2); this adds the nudge timestamp.
--
-- Additive + reversible — a nullable column, no backfill, no data touched.
-- Rollback: alter table leads drop column followup_sent_at;
-- =============================================================================

alter table leads
  add column if not exists followup_sent_at timestamptz;

-- A partial index for the cron's selection (unconverted popup leads not yet
-- nudged). Keeps the 48h sweep cheap as the table grows.
create index if not exists idx_leads_followup_pending
  on leads (created_at)
  where source_type = 'popup' and converted = false and followup_sent_at is null;

-- Rollback:
-- drop index if exists idx_leads_followup_pending;
-- alter table leads drop column followup_sent_at;
