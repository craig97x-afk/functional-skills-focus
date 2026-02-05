import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

export default async function BillingSuccessPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  return (
    <main className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Subscription started</h1>
      <p className="text-sm text-gray-400">
        If access doesn’t unlock immediately, give it a refresh. Webhooks can take a moment.
      </p>

      <div className="flex gap-2 flex-wrap">
        <a className="rounded-md border px-4 py-2" href="/maths">
          Go to Maths
        </a>
        <a className="rounded-md border px-4 py-2" href="/mastery">
          View Mastery
        </a>
      </div>
    </main>
  );
}
