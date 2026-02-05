import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Next.js proxy (replacement for deprecated middleware) to gate premium routes.
export async function proxy(req: NextRequest) {
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

  const { data: authData } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? authData.user;

  if (!user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const authedClient =
    session?.access_token
      ? createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
            global: {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            },
          }
        )
      : supabase;

  const { data: profile } = await authedClient
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
