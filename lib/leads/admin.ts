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
}

/** The columns exported to CSV, in order. */
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
] as const;

const LIST_SELECT =
  "id, name, phone, email, source_type, source_page, consent_whatsapp, converted, converted_order_id, created_at";

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
  }));
}

/** Escape one CSV field (RFC 4180): wrap in quotes, double internal quotes. */
function csvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
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
