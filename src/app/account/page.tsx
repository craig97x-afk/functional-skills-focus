import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import AccountDeleteButton from "./delete-button";

export default async function AccountPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  return (
    <main className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Account</h1>

      <section className="rounded-lg border p-4 space-y-2">
        <div className="text-sm text-gray-500">Signed in as</div>
        <div className="font-medium">{session.user.email}</div>
        <div className="text-sm text-gray-500">Role: {session.profile?.role}</div>
      </section>

      {session.profile?.role !== "admin" ? (
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">Delete account</h2>
          <p className="text-sm text-gray-600">
            This permanently deletes your account and learning data. If you have an active subscription, it will be cancelled.
          </p>
          <AccountDeleteButton />
        </section>
      ) : (
        <section className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">
            Admin deletion is disabled.
          </p>
        </section>
      )}
    </main>
  );
}
