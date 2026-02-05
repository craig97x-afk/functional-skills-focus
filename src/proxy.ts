import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js proxy (replacement for deprecated middleware) to gate premium routes.
export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const protectedPrefixes = ["/practice", "/progress", "/mastery"];
  const isProtected = protectedPrefixes.some((p) => url.pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) {
    console.error("[proxy] auth error", authErr.message);
  }
  const user = authData.user;

  if (!user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role, is_subscribed, access_override")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) {
    console.error("[proxy] profile error", profileErr.message);
  } else {
    console.log("[proxy] profile", {
      userId: user.id,
      role: profile?.role,
      is_subscribed: profile?.is_subscribed,
      access_override: profile?.access_override,
      path: url.pathname,
    });
  }

  // Admin always allowed
  if (profile?.role === "admin") return res;

  // Manual override allowed
  if (profile?.access_override) return res;

  // Paid users allowed
  if (profile?.is_subscribed) return res;

  // Everyone else gets pricing
  url.pathname = "/pricing";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/practice/:path*", "/progress", "/mastery"],
};
