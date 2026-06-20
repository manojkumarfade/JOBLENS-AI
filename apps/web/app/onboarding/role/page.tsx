"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Chrome, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/lib/auth/clientFetch";

type Role = "candidate" | "recruiter";

const roles = [
  {
    id: "candidate" as const,
    title: "Candidate / General User",
    description: "Use the Chrome extension to summarize any webpage, upload your resume, and analyze job fit by voice.",
    cta: "Continue as Candidate",
    icon: Chrome
  },
  {
    id: "recruiter" as const,
    title: "Recruiter",
    description: "Enter job descriptions, upload candidate profiles, and generate ranked shortlists.",
    cta: "Continue as Recruiter",
    icon: BriefcaseBusiness
  }
];

export default function RoleOnboardingPage() {
  const router = useRouter();
  const [savingRole, setSavingRole] = useState<Role | null>(null);
  const [message, setMessage] = useState("");

  async function chooseRole(role: Role) {
    setSavingRole(role);
    setMessage("");
    const res = await authFetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_role: role })
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(body?.error?.message ?? "Could not save role. You can continue as a candidate.");
      setSavingRole(null);
      return;
    }
    router.push(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl font-bold">How do you want to use JobLens?</h1>
          <p className="mt-3 text-muted-foreground">
            One account unlocks the browser voice copilot, candidate resume fit analysis, and recruiter ranking tools.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className="border-primary/20">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="min-h-16 text-sm leading-6 text-muted-foreground">{role.description}</p>
                  <Button className="w-full" onClick={() => chooseRole(role.id)} disabled={Boolean(savingRole)}>
                    {savingRole === role.id ? "Saving..." : role.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {message ? <p className="mx-auto mt-6 max-w-xl rounded-md border bg-muted p-3 text-center text-sm">{message}</p> : null}
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => chooseRole("candidate")} disabled={Boolean(savingRole)}>
            Skip for now
          </Button>
        </div>
      </div>
    </main>
  );
}
