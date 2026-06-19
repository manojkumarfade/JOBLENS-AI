import { redirect } from "next/navigation";
import { RecruiterDashboardClient } from "@/components/recruiter/RecruiterDashboardClient";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/data/users";
import { hasSeenTutorial } from "@/lib/data/tutorials";

export default async function RecruiterDashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id).catch(() => null);
  return <RecruiterDashboardClient tutorialSeen={hasSeenTutorial(profile, "recruiter")} />;
}
