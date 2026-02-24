import { getUser } from "@/lib/auth/get-user";

export async function getAuthContext() {
  const session = await getUser();
  const user = session?.user ?? null;
  const profile = session?.profile ?? null;
  const isAdmin = profile?.role === "admin";

  return {
    session,
    user,
    profile,
    isAdmin,
  };
}
