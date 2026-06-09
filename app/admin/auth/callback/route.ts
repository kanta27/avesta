import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail } from "@/lib/auth/admin-allowlist";

/**
 * Magic-link callback (A6). Supabase redirects here with a `?code=` after the
 * admin clicks the email link. We exchange it for a session (PKCE) and then
 * RE-CHECK the allow-list server-side: if a session somehow belongs to a
 * non-allow-listed email, we sign it out rather than let it linger.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAllowedAdminEmail(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?denied=1", request.url));
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
