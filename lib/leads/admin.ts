import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin leads data layer (feature 12, module 4). Service-role — `leads` is RLS
 * deny-all to the public. `server-only`; callers (the leads page + the CSV
 * export route) gate on `requireAdmin()` first.
 *
 * Leads are READ-ONLY in the admin: the panel views, filters, and exports them;
 * it never writes them (capture is feature 9; the conversion flip is the
 * checkout's job). So there are no mutations here.
 */

/** The lead source types (A2 check constraint). */
export const LEAD_SOURCE_TYPES = [
  "popup",
  "newsletter",
  "b2b",
  "quiz",
] as const;

export type LeadSourceType = (typeof LEAD_SOURCE_TYPES)[number];

export function isLeadSourceType(v: string): v is LeadSourceType {
  return (LEAD_SOURCE_TYPES as readonly string[]).includes(v);
}

export interface LeadFilter {
  sourceType?: LeadSourceType;
  /** true → only converted, false → only un-converted, undefined → all. */
  converted?: boolean;
}

/** The B2B-only extras parked in the `quiz_answers` jsonb (feature 15). */
export interface B2bExtras {
  orgType: string | null;
  volume: string | null;
  message: string | null;
}

/** A lead row for the admin list. */
export interface LeadListItem {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  sourceType: string;
  sourcePage: string | null;
  consentWhatsapp: boolean;
  converted: boolean;
  convertedOrderId: string | null;
  createdAt: string | null;
  /** Present for B2B leads — the org/volume/message from `quiz_answers`. */
  b2b: B2bExtras | null;
}

/** Pull the B2B fields out of the loosely-typed `quiz_answers` jsonb. */
function b2bExtrasFrom(quizAnswers: unknown): B2bExtras | null {
  if (!quizAnswers || typeof quizAnswers !== "object") return null;
  const a = quizAnswers as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
  const extras: B2bExtras = {
    orgType: str(a.org_type),
    volume: str(a.volume),
    message: str(a.message),
  };
  // Only treat it as B2B extras if at least one field is present.
  return extras.orgType || extras.volume || extras.message ? extras : null;
}

/** The columns exported to CSV, in order. `quiz_answers` carries the B2B
 *  org/volume/message (feature 15) — without it a B2B inquiry's actual ask is
 *  unreadable in the export. */
const EXPORT_COLUMNS = [
  "created_at",
  "name",
  "phone",
  "email",
  "source_type",
  "source_page",
  "consent_whatsapp",
  "consent_at",
  "converted",
  "converted_order_id",
  "recommended_product_id",
  "quiz_answers",
] as const;

const LIST_SELECT =
  "id, name, phone, email, source_type, source_page, consent_whatsapp, converted, converted_order_id, created_at, quiz_answers";

/** List leads (newest first), optionally filtered by source type / conversion. */
export async function listLeads(
  filter: LeadFilter = {},
): Promise<LeadListItem[]> {
  const admin = createAdminClient();
  let query = admin
    .from("leads")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (filter.sourceType) query = query.eq("source_type", filter.sourceType);
  if (filter.converted !== undefined) {
    query = query.eq("converted", filter.converted);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list leads: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    sourceType: row.source_type,
    sourcePage: row.source_page,
    consentWhatsapp: row.consent_whatsapp ?? false,
    converted: row.converted ?? false,
    convertedOrderId: row.converted_order_id,
    createdAt: row.created_at,
    b2b: b2bExtrasFrom(row.quiz_answers),
  }));
}

/** Escape one CSV field (RFC 4180): wrap in quotes, double internal quotes.
 *  Objects (the `quiz_answers` jsonb) are JSON-serialized so the B2B
 *  org/volume/message survive the export instead of becoming "[object Object]". */
function csvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** The CSV header row (column names), newline-terminated. */
export function leadsCsvHeader(): string {
  return EXPORT_COLUMNS.join(",") + "\r\n";
}

/**
 * Stream leads as CSV rows, paging through the table so the whole result set is
 * never held in memory at once. Yields one newline-terminated CSV line per lead;
 * the route handler enqueues each into the HTTP response as it arrives.
 */
export async function* iterateLeadsCsv(
  filter: LeadFilter = {},
): AsyncGenerator<string> {
  const admin = createAdminClient();
  const pageSize = 1000;
  let from = 0;

  for (;;) {
    let query = admin
      .from("leads")
      .select(EXPORT_COLUMNS.join(", "))
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (filter.sourceType) query = query.eq("source_type", filter.sourceType);
    if (filter.converted !== undefined) {
      query = query.eq("converted", filter.converted);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to export leads: ${error.message}`);
    if (!data || data.length === 0) return;

    for (const row of data) {
      // The dynamic-string select() loses element typing; treat each row as a
      // plain record keyed by the export columns.
      const record = row as unknown as Record<string, unknown>;
      yield EXPORT_COLUMNS.map((col) => csvField(record[col])).join(",") + "\r\n";
    }

    if (data.length < pageSize) return;
    from += pageSize;
  }
}
