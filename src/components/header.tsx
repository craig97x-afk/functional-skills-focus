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
              <div className="apple-nav-group">
                <button className={navItem} type="button">
                  Maths
                </button>
                <div className="apple-nav-menu">
                  <Link className="apple-nav-menu-item" href="/maths">
                    Overview
                  </Link>
                  <Link className="apple-nav-menu-item" href="/maths/learn">
                    Learning
                  </Link>
                  <Link className="apple-nav-menu-item" href="/maths/practice">
                    Practice
                  </Link>
                  <Link className="apple-nav-menu-item" href="/maths/mocks">
                    Exam mocks
                  </Link>
                  <Link className="apple-nav-menu-item" href="/maths/resources">
                    Resources
                  </Link>
                </div>
              </div>

              <div className="apple-nav-group">
                <button className={navItem} type="button">
                  English
                </button>
                <div className="apple-nav-menu">
                  <Link className="apple-nav-menu-item" href="/english">
                    Overview
                  </Link>
                  <Link className="apple-nav-menu-item" href="/english">
                    Learning (soon)
                  </Link>
                  <Link className="apple-nav-menu-item" href="/english">
                    Practice (soon)
                  </Link>
                </div>
              </div>

              <div className="apple-nav-group">
                <button className={navItem} type="button">
                  Progress
                </button>
                <div className="apple-nav-menu">
                  <Link className="apple-nav-menu-item" href="/progress">
                    Progress
                  </Link>
                  <Link className="apple-nav-menu-item" href="/mastery">
                    Mastery
                  </Link>
                  <Link className="apple-nav-menu-item" href="/review">
                    Review mistakes
                  </Link>
                </div>
              </div>
            </>
          )}

          <Link href="/guides" className={navItem}>
            Guides
          </Link>

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

          {session ? (
            <div className="apple-nav-group">
              <button className={navPill} type="button">
                Account
              </button>
              <div className="apple-nav-menu apple-nav-menu-right">
                <Link className="apple-nav-menu-item" href="/account">
                  Account
                </Link>
                <form action={signOut}>
                  <button className="apple-nav-menu-item apple-nav-menu-button" type="submit">
                    Logout
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <Link href="/login" className={navPrimary}>
              Login
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
