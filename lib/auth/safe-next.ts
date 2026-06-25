/**
 * Sanitize a post-login `?next=` target into a SAFE same-origin path.
 *
 * Open-redirect guard: only accept a value that is an absolute path on this
 * site. Reject anything that could send the user off-origin —
 *   - `//evil.com` (protocol-relative)
 *   - `/\evil.com` (backslash trick some parsers normalize to `//`)
 *   - `https://…`, `mailto:…`, etc. (anything not starting with a single `/`)
 * Anything rejected falls back to `fallback`.
 */
export function safeNextPath(raw: unknown, fallback = "/account"): string {
  if (
    typeof raw === "string" &&
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    !raw.startsWith("/\\")
  ) {
    return raw;
  }
  return fallback;
}
