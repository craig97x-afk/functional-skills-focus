import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const session = await getUser();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const navItem =
    "rounded-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-black/5 transition";
  const navPill =
    "rounded-full border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-black/5 transition";
  const navPrimary =
    "rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 transition";

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Functional Skills Focus
        </Link>

        <nav className="flex items-center gap-2 flex-wrap justify-end">
          {session && (
            <Link href="/maths" className={navItem}>
              Maths
            </Link>
          )}

          {session && (
            <Link href="/progress" className={navItem}>
              Progress
            </Link>
          )}

          {session && (
            <Link href="/mastery" className={navItem}>
              Mastery
            </Link>
          )}

          {session && session.profile?.role !== "admin" && (
            <Link href="/pricing" className={navItem}>
              Pricing
            </Link>
          )}

          {session?.profile?.role === "admin" && (
            <Link href="/admin" className={navPill}>
              Admin
            </Link>
          )}

          {session && (
            <Link href="/account" className={navPill}>
              Account
            </Link>
          )}

          {!session ? (
            <Link href="/login" className={navPrimary}>
              Login
            </Link>
          ) : (
            <form action={signOut}>
              <button className={navPill} type="submit">
                Logout
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
