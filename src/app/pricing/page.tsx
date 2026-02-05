import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

export default async function PricingPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  return (
    <main className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Pricing</h1>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-lg font-semibold">Student Membership</div>
        <p className="text-sm text-gray-400">
          Unlimited practice, progress tracking, and mastery stats.
        </p>

        <form action="/api/stripe/checkout" method="post">
          <button className="rounded-md border px-4 py-2">
            Subscribe
          </button>
        </form>

        <p className="text-xs text-gray-500">
          You’ll be redirected to Stripe checkout.
        </p>
      </div>
    </main>
  );
}
