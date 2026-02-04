import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import SubscribeButton from "./subscribe-button";

export default async function PricingPage() {
  const session = await getUser();
  if (!session) redirect("/login");
  if (session.profile?.role === "admin") redirect("/admin");

  return (
    <main className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Subscription</h1>
      <p className="text-gray-500">
        Full access to Maths lessons + practice + progress tracking.
      </p>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-lg font-semibold">Monthly plan</div>
        <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">
          <li>Unlimited practice questions</li>
          <li>Progress + mastery tracking</li>
          <li>All published lessons</li>
        </ul>

        <SubscribeButton />
      </div>
    </main>
  );
}
