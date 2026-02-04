import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

export async function requireAdmin() {
  const session = await getUser();
  if (!session) redirect("/login");

  const role = session.profile?.role;
  if (role !== "admin") redirect("/");

  return session;
}
