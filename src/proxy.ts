import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js proxy (replacement for deprecated middleware) to gate premium routes.
export default async function proxy(req: NextRequest) {
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

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_subscribed, access_override")
    .eq("id", user.id)
    .maybeSingle();

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
