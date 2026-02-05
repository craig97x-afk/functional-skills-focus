import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import ResyncButton from "./resync-button";

export const runtime = "nodejs";

type ProfileRow = {
  id: string;
  role: string | null;
  is_subscribed: boolean | null;
  access_override: boolean | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_status: string | null;
  stripe_status_updated_at: string | null;
};

export default async function AdminBillingPage() {
  await requireAdmin();

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profiles, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, role, is_subscribed, access_override, stripe_customer_id, stripe_subscription_id, stripe_status, stripe_status_updated_at"
    )
    .order("id");

  const { data: usersData, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });

  const emailById = new Map<string, string>();
  (usersData?.users ?? []).forEach((u) => {
    if (u.email) emailById.set(u.id, u.email);
  });

  if (profileErr) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Billing Audit</h1>
        <p className="text-sm text-red-400">Failed to load profiles: {profileErr.message}</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Billing Audit</h1>
      <p className="text-sm text-gray-500">
        First 100 users shown. Emails are pulled via admin API.
        {usersErr ? ` Email lookup error: ${usersErr.message}` : ""}
      </p>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-9 gap-2 px-4 py-3 text-xs text-gray-400 border-b">
          <div>Email</div>
          <div>Role</div>
          <div>Subscribed</div>
          <div>Override</div>
          <div>Stripe Customer</div>
          <div>Stripe Subscription</div>
          <div>Status</div>
          <div>Last Sync</div>
          <div>Actions</div>
        </div>

        <div className="divide-y">
          {(profiles ?? []).map((p: ProfileRow) => {
            const status = p.stripe_status ?? "-";
            const updatedAt = p.stripe_status_updated_at
              ? new Date(p.stripe_status_updated_at).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "-";
            const isActive = status === "active" || status === "trialing";
            const mismatch =
              (p.is_subscribed && !isActive) || (!p.is_subscribed && isActive);

            return (
              <div key={p.id} className="grid grid-cols-9 gap-2 px-4 py-3 text-sm">
              <div className="truncate">{emailById.get(p.id) ?? p.id}</div>
              <div>{p.role ?? "-"}</div>
              <div>{p.is_subscribed ? "true" : "false"}</div>
              <div>{p.access_override ? "true" : "false"}</div>
              <div className="truncate">{p.stripe_customer_id ?? "-"}</div>
              <div className="truncate">{p.stripe_subscription_id ?? "-"}</div>
              <div className={mismatch ? "text-yellow-500" : ""}>{status}</div>
              <div className={mismatch ? "text-yellow-500" : ""}>{updatedAt}</div>
              <div>
                <ResyncButton userId={p.id} disabled={!p.stripe_subscription_id} />
              </div>
            </div>
            );
          })}

          {(profiles ?? []).length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No profiles found.</div>
          )}
        </div>
      </div>
    </main>
  );
}
