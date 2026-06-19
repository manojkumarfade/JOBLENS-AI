import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/data/users";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id).catch(() => null);
  if (profile?.user_role === "recruiter") redirect("/dashboard/recruiter");
  redirect("/dashboard/candidate");
}
