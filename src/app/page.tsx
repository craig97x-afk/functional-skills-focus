import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ManageBillingButton from "@/components/billing/manage-billing-button";

export default async function HomePage() {
  const session = await getUser();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.email_confirmed_at) {
  redirect("/verify-email");
  }


  const supabase = await createClient();

  // Fetch subscription ONLY for students
  const { data: subscription } =
    session.profile?.role !== "admin"
      ? await supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_id", session.user.id)
          .single()
      : { data: null };

  const isActive =
    subscription?.status === "active" ||
    subscription?.status === "trialing";

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Role: {session.profile?.role}</p>

      {/* Main navigation buttons */}
      <div className="flex gap-4 flex-wrap">
        <a href="/maths" className="rounded-md border px-4 py-2">
          Go to Maths
        </a>

        {session.profile?.role === "admin" && (
          <a href="/admin" className="rounded-md border px-4 py-2">
            Admin Panel
          </a>
        )}
      </div>

      {/* Subscription status – students only */}
      {session.profile?.role !== "admin" && (
        <div className="rounded-md border p-4 max-w-md space-y-2">
          <div className="text-sm text-gray-500">
            Subscription status
          </div>

          <div className="text-lg font-semibold">
            {isActive ? "Active" : "Inactive"}
          </div>

          {subscription?.current_period_end && (
            <div className="text-xs text-gray-500">
              Renews on{" "}
              {new Date(
                subscription.current_period_end
              ).toLocaleDateString()}
            </div>
          )}

          <div className="pt-2">
            <ManageBillingButton />
          </div>
        </div>
      )}
    </main>
  );
}
