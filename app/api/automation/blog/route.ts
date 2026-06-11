import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env.server";
import { createAutomationDraft } from "@/lib/blog/admin";
import { automationPayloadSchema } from "@/lib/blog/validation";

// Service-role insert into the RLS-locked `blog_posts` table. Node runtime.
export const runtime = "nodejs";

/**
 * POST /api/automation/blog — accept an agent-submitted blog DRAFT (feature 16).
 *
 * SECURITY POSTURE (two non-negotiable guardrails):
 *
 * 1. Token fail-closed (mirrors the cron route). `AUTOMATION_API_TOKEN` is
 *    optional/unset today, so:
 *      - unset  → the endpoint refuses ALL requests (503); it can never be live
 *        without an explicit token.
 *      - set    → the request MUST carry `Authorization: Bearer <token>`; a
 *        missing or wrong bearer is rejected (401) BEFORE any parsing or DB work.
 *
 * 2. Never auto-published. The insert HARDCODES `status='review'` and
 *    `source='automation'` in the data layer (`createAutomationDraft`). The
 *    request body is validated by `automationPayloadSchema`, which has NO status
 *    or source field — any such key in the body is stripped and ignored. Only a
 *    human admin can transition the post to 'published'.
 *
 * 3. `body_md` is UNTRUSTED. It is stored as-is and only ever rendered through
 *    the allowlist sanitizer (`components/blog/Markdown.tsx`) — never as raw HTML.
 */
export async function POST(request: Request) {
  const env = serverEnv();

  // 1. Fail closed when unconfigured — never runnable without a token.
  if (!env.AUTOMATION_API_TOKEN) {
    return NextResponse.json(
      { error: "Automation endpoint is not configured." },
      { status: 503 },
    );
  }

  // 2. Authenticate the bearer BEFORE any parsing or DB work.
  if (
    request.headers.get("authorization") !==
    `Bearer ${env.AUTOMATION_API_TOKEN}`
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // 3. Parse the body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 4. Validate the CONTENT fields only. No status/source here — the server
  //    decides both. Extra keys (e.g. an attempted status='published') are
  //    stripped by zod and never reach the insert.
  const parsed = automationPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.join(".") ?? "body";
    return NextResponse.json(
      { error: `Invalid ${where}: ${first?.message ?? "validation failed"}` },
      { status: 400 },
    );
  }

  // 5. Insert as a REVIEW draft from AUTOMATION (both hardcoded in the data
  //    layer). Returns the created id + generated slug.
  try {
    const { id, slug } = await createAutomationDraft(parsed.data);
    return NextResponse.json(
      { id, slug, status: "review", source: "automation" },
      { status: 201 },
    );
  } catch (err) {
    console.error("[automation/blog] insert failed:", err);
    return NextResponse.json(
      { error: "Could not save the draft." },
      { status: 500 },
    );
  }
}
