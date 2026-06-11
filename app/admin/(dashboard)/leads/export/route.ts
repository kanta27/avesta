import { requireAdmin } from "@/lib/auth/require-admin";
import {
  isLeadSourceType,
  iterateLeadsCsv,
  leadsCsvHeader,
  type LeadFilter,
} from "@/lib/leads/admin";

/**
 * Leads CSV export (feature 12, module 4).
 *
 * requireAdmin() FIRST (redirects to login if not an allow-listed admin), then
 * STREAMS the CSV straight from `leads` via a paged async generator — the full
 * result set is never buffered in memory. Honors the same source_type /
 * converted filters as the list page (passed as query params).
 */
export async function GET(request: Request) {
  await requireAdmin();

  const url = new URL(request.url);
  const filter: LeadFilter = {};

  const sourceType = url.searchParams.get("source_type");
  if (sourceType && isLeadSourceType(sourceType)) {
    filter.sourceType = sourceType;
  }
  const converted = url.searchParams.get("converted");
  if (converted === "yes") filter.converted = true;
  else if (converted === "no") filter.converted = false;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(leadsCsvHeader()));
        for await (const line of iterateLeadsCsv(filter)) {
          controller.enqueue(encoder.encode(line));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  const date = new Date().toISOString().slice(0, 10);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
