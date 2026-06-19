import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getRoleForUser } from "@/lib/auth/roles";

export default async function RecruiterDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const role = await getRoleForUser(user.id);
  if (role !== "recruiter") redirect("/dashboard/candidate");
  return children;
}
