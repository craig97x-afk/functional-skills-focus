import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import ResendVerification from "./resend";

export default async function VerifyEmailPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const confirmed = Boolean(session.user.email_confirmed_at);

  return (
    <main className="p-6 max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Verify your email</h1>

      {confirmed ? (
        <>
          <p className="text-sm text-gray-600">Email verified. You’re good to go.</p>
          <a href="/" className="inline-block rounded-md border px-4 py-2">Continue</a>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            We sent a verification link to <span className="font-medium">{session.user.email}</span>.
            Click it, then come back.
          </p>

          <ResendVerification email={session.user.email ?? ""} />

          <p className="text-xs text-gray-500">
            Check spam/junk. If you’re using a school/work email, filters can be aggressive.
          </p>
        </>
      )}
    </main>
  );
}
