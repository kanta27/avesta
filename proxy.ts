import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import { isAllowedAdminEmail } from "@/lib/auth/admin-allowlist";

/**
 * Edge gate for the admin area (A6).
 *
 * Next 16 renamed the `middleware` file convention to `proxy`; this is the same
 * request-interception gate the spec calls "middleware".
 *
 * Runs only on `/admin/*` (see `config.matcher`), so the public storefront is
 * untouched. On every admin request it:
 *   1. Refreshes the Supabase session via the request/response cookie bridge.
 *      The response whose cookies the client mutated MUST be the one returned,
 *      or the refreshed session is dropped.
 *   2. Reads the user with `getUser()` (revalidates the JWT) and checks the
 *      email against the allow-list.
 *   3. Keeps `/admin/login` and `/admin/auth/*` always reachable (otherwise you
 *      could never get to the login page to authenticate), and redirects every
 *      other `/admin/*` request that is not an allow-listed admin to the login.
 *
 * This is the first line of defence only. Mutating server actions independently
 * call `requireAdmin()` — a proxy/middleware can be bypassed by a direct POST.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser() —
  // it keeps the session fresh and avoids hard-to-debug logout bugs.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAllowedAdminEmail(user?.email);

  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname === "/admin/login" || pathname.startsWith("/admin/auth");

  if (isAuthRoute) {
    // An already-authenticated admin has no reason to see the login page.
    if (pathname === "/admin/login" && isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (!isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    // Signal "you have a session but it's not allow-listed" vs. plain "logged out".
    url.search = user ? "denied=1" : "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
