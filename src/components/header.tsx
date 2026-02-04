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

  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Functional Skills Focus
        </Link>

        <nav className="flex items-center gap-3">
          {session && (
            <Link href="/maths" className="rounded-md border px-3 py-2">
              Maths
            </Link>
          )}

          {session && (
          <Link href="/progress" className="rounded-md border px-3 py-2">
            Progress
          </Link>
          )}

          {session && (
          <Link href="/mastery" className="rounded-md border px-3 py-2">
            Mastery
          </Link>
          )}

          {session && session.profile?.role !== "admin" && (
          <Link href="/pricing" className="rounded-md border px-3 py-2">
            Pricing
          </Link>
          )}




          {session?.profile?.role === "admin" && (
            <Link href="/admin" className="rounded-md border px-3 py-2">
              Admin
            </Link>
          )}

          
          {session && (
            <Link href="/account" className="rounded-md border px-3 py-2">
            Account
            </Link>
          )}

          {!session ? (
            <Link href="/login" className="rounded-md border px-3 py-2">
              Login
            </Link>
          ) : (
            <form action={signOut}>
              <button className="rounded-md border px-3 py-2" type="submit">
                Logout
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
