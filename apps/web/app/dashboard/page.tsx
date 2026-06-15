import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalysisCard } from "@/components/dashboard/AnalysisCard";
import { UsageMeter } from "@/components/dashboard/UsageMeter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { recentAnalyses } from "@/lib/data/analyses";
import { activeResume } from "@/lib/data/resumes";
import { getProfile } from "@/lib/data/users";
import { planLimit } from "@/lib/quota/limits";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const [profile, analyses, resume] = await Promise.all([
    getProfile(user.id),
    recentAnalyses(user.id, 5),
    activeResume(user.id)
  ]);
  const limit = planLimit(profile?.plan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="mt-2 text-muted-foreground">Plan: {profile?.plan ?? "free"}</p>
      </div>
      {!resume ? (
        <Card>
          <CardHeader><CardTitle>Upload your resume to unlock matching and tailoring</CardTitle></CardHeader>
          <CardContent><Button asChild><Link href="/dashboard/resume">Upload resume</Link></Button></CardContent>
        </Card>
      ) : null}
      <UsageMeter used={analyses.length} limit={limit} plan={profile?.plan} />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["/dashboard/resume", "Upload resume"],
          ["/dashboard/analyses", "View analyses"],
          ["/dashboard/settings/voice", "Voice settings"],
          ["/install-extension", "Install extension"]
        ].map(([href, label]) => (
          <Button key={href} asChild variant="outline"><Link href={href}>{label}</Link></Button>
        ))}
      </div>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Recent analyses</h2>
        {analyses.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {analyses.map((analysis) => <AnalysisCard key={analysis.id} analysis={analysis} />)}
          </div>
        ) : (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No saved analyses yet.</CardContent></Card>
        )}
      </section>
    </div>
  );
}
