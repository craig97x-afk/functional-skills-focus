import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/theme-toggle";

export default async function Header() {
  const session = await getUser();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const navItem = "apple-nav";
  const navPill = "apple-nav-pill";
  const navPrimary = "apple-nav-primary";

  return (
    <header className="apple-header sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Functional Skills Focus
        </Link>

        <nav className="flex items-center gap-2 flex-wrap justify-end">
          {session && (
            <>
              <Link href="/maths" className={navItem}>
                Maths
              </Link>
              <Link href="/english" className={navItem}>
                English
              </Link>
              <Link href="/guides" className={navItem}>
                Guides
              </Link>
              <Link href="/progress" className={navItem}>
                Progress
              </Link>
              <Link href="/mastery" className={navItem}>
                Mastery
              </Link>
            </>
          )}

          {!session && (
            <Link href="/guides" className={navItem}>
              Guides
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

          <ThemeToggle />

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
