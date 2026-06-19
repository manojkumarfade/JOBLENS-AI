import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CandidateDashboardClient } from "@/components/candidate/CandidateDashboardClient";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { recentAnalyses } from "@/lib/data/analyses";
import { activeResume } from "@/lib/data/resumes";
import { getProfile } from "@/lib/data/users";
import { hasSeenTutorial } from "@/lib/data/tutorials";

export default async function CandidateDashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const [resume, analyses, profile, headerStore] = await Promise.all([
    activeResume(user.id).catch(() => null),
    recentAnalyses(user.id, 5).catch(() => []),
    getProfile(user.id).catch(() => null),
    headers()
  ]);
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";

  return (
    <CandidateDashboardClient
      resume={
        resume
          ? {
              id: String(resume.id),
              original_filename: String(resume.original_filename ?? "Active resume"),
              experience_level: typeof resume.experience_level === "string" ? resume.experience_level : null,
              skills: Array.isArray(resume.skills) ? resume.skills.map(String) : []
            }
          : null
      }
      analyses={analyses}
      backendUrl={`${proto}://${host}`}
      profile={{
        name: profile?.display_name ?? profile?.full_name ?? null,
        email: profile?.email ?? user.email,
        createdAt: profile?.created_at ?? null
      }}
      tutorialSeen={hasSeenTutorial(profile, "candidate")}
    />
  );
}
