import "server-only";

/**
 * Lightweight per-IP fixed-window rate limiter for the order-lookup endpoint.
 *
 * WHY this exists: `/api/track` is the one place a guest can probe an order by
 * (number, phone). The pair is the authz check, so the brute-force risk is
 * guessing a phone against a known/sequential order number. A modest per-IP cap
 * makes that economically pointless without inconveniencing a real customer who
 * mistypes a digit once or twice.
 *
 * HONEST LIMITS: state lives in module memory, so the window is per server
 * INSTANCE — it resets on redeploy and is NOT shared across the multiple
 * instances a serverless/Fluid deployment may run. That is deliberately
 * acceptable for a deterrent (the spec calls for a lightweight implementation),
 * and the whole backend is isolated behind `checkRateLimit` so swapping in a
 * shared store (Upstash / Vercel rate-limit) later is a one-file change.
 */

/** Max lookups allowed per IP within one window. */
const LIMIT = 10;
/** Window length in milliseconds. */
const WINDOW_MS = 60_000;
/** Safety cap on tracked IPs; beyond this we sweep expired entries eagerly. */
const MAX_ENTRIES = 10_000;

interface Window {
  /** Requests counted in the current window. */
  count: number;
  /** Epoch ms when the current window ends and the count resets. */
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  /** True when the request is within the allowance and may proceed. */
  ok: boolean;
  /** Seconds the caller should wait before retrying (only meaningful when blocked). */
  retryAfterSeconds: number;
}

/**
 * Record one lookup attempt from `ip` and report whether it is allowed. A fresh
 * IP (or one whose window has elapsed) starts a new window; subsequent calls in
 * the same window increment until `LIMIT` is exceeded, after which `ok` is
 * false until the window rolls over.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(ip);

  if (!existing || now >= existing.resetAt) {
    if (windows.size >= MAX_ENTRIES) sweepExpired(now);
    windows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > LIMIT) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** Drop windows that have already elapsed — bounds memory under a probe flood. */
function sweepExpired(now: number): void {
  for (const [ip, w] of windows) {
    if (now >= w.resetAt) windows.delete(ip);
  }
}

/**
 * Best-effort client IP from the proxy headers Vercel/Next set. Falls back to a
 * single shared bucket when no header is present (e.g. local dev) — that only
 * makes the limiter STRICTER, never a bypass, which is the safe failure mode.
 */
export function clientIpFrom(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
