"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Trash2 } from "lucide-react";
import type { CredentialStatus, VoicePreferences } from "@joblens/shared";
import { getModelLabel } from "@joblens/shared";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type ExtensionStatus = {
  checking: boolean;
  installed: boolean;
  signedIn: boolean;
};

type ResumeView = {
  id: string;
  original_filename: string;
  is_active: boolean;
  experience_level?: string | null;
  created_at?: string | null;
};

type BillingStatus = {
  plan: "free" | "pro" | "byok" | string;
  status: string;
  renewsAt: string | null;
  portalUrl: string | null;
};

export function SettingsClient({
  email,
  name,
  initialUsername,
  initialDisplayName,
  initialRole = "candidate"
}: {
  email?: string | null;
  name?: string | null;
  initialUsername?: string | null;
  initialDisplayName?: string | null;
  initialRole?: "candidate" | "recruiter";
}) {
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState<VoicePreferences | null>(null);
  const [credentials, setCredentials] = useState<CredentialStatus | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [resumes, setResumes] = useState<ResumeView[]>([]);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [extension, setExtension] = useState<ExtensionStatus>({ checking: true, installed: false, signedIn: false });
  const [backendOrigin, setBackendOrigin] = useState("");
  const [displayName, setDisplayName] = useState(initialDisplayName ?? name ?? "");
  const [username, setUsername] = useState(initialUsername ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter">(initialRole);
  const [memory, setMemory] = useState("");
  const [memoryLoaded, setMemoryLoaded] = useState(false);
  const [memorySaving, setMemorySaving] = useState(false);

  useEffect(() => {
    setBackendOrigin(window.location.origin);
    void load();
    void loadMemory();
    probeExtension();
  }, []);

  async function load() {
    const [prefsRes, credsRes, resumesRes, billingRes] = await Promise.all([
      fetch("/api/voice/preferences"),
      fetch("/api/settings/model-credentials"),
      fetch("/api/resumes"),
      fetch("/api/billing/status")
    ]);
    if (prefsRes.ok) setPreferences(await prefsRes.json());
    if (credsRes.ok) setCredentials(await credsRes.json());
    if (resumesRes.ok) setResumes((await resumesRes.json()).resumes ?? []);
    if (billingRes.ok) setBilling(await billingRes.json());
  }

  async function loadMemory() {
    const res = await fetch("/api/settings/memory");
    if (res.ok) {
      const data = await res.json();
      setMemory(data.memory_text ?? "");
    }
    setMemoryLoaded(true);
  }

  function probeExtension() {
    setExtension({ checking: true, installed: false, signedIn: false });
    const timer = window.setTimeout(() => {
      setExtension((current) => (current.installed ? { ...current, checking: false } : { checking: false, installed: false, signedIn: false }));
      window.removeEventListener("message", onMessage);
    }, 900);

    function onMessage(event: MessageEvent) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; installed?: boolean; signedIn?: boolean };
      if (data.type !== "JOBLENS_EXTENSION_STATUS_RESPONSE") return;
      window.clearTimeout(timer);
      setExtension({ checking: false, installed: Boolean(data.installed), signedIn: Boolean(data.signedIn) });
      window.removeEventListener("message", onMessage);
    }

    window.addEventListener("message", onMessage);
    window.postMessage({ type: "JOBLENS_EXTENSION_STATUS_REQUEST" }, window.location.origin);
  }

  async function saveProfile() {
    setProfileSaving(true);
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, username: username || undefined, user_role: role })
    });
    const data = await res.json().catch(() => null);
    setProfileMsg(res.ok ? "Saved." : data?.error?.message ?? "Could not save.");
    setProfileSaving(false);
  }

  async function saveMemory() {
    setMemorySaving(true);
    const res = await fetch("/api/settings/memory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memory_text: memory })
    });
    setMessage(res.ok ? "AI memory saved." : "Could not save AI memory.");
    setMemorySaving(false);
  }

  async function deleteData() {
    if (!confirm("Delete analyses, transcripts, page contexts, credentials, voice sessions, and resume files?")) return;
    const res = await fetch("/api/privacy/delete-data", { method: "POST" });
    setMessage(res.ok ? "Your JobLens data was deleted." : "Could not delete data.");
    if (res.ok) await load();
  }

  async function deleteAccount() {
    if (!confirm("Delete your account and all associated data?")) return;
    const res = await fetch("/api/privacy/delete-account", { method: "POST" });
    setMessage(res.ok ? "Account deletion requested." : "Could not delete account.");
  }

  async function setActive(id: string) {
    setWorkingId(id);
    const res = await fetch(`/api/resumes/${id}/active`, { method: "POST" });
    setMessage(res.ok ? "Active resume updated." : "Could not update active resume.");
    await load();
    setWorkingId(null);
  }

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume and its stored file?")) return;
    setWorkingId(id);
    setResumes((prev) => prev.filter((resume) => resume.id !== id));
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(body?.error?.message ?? "Could not delete resume.");
      await load();
    } else {
      setMessage("Resume deleted.");
      if (body?.activeResumeId) {
        setResumes((prev) => prev.map((resume) => ({ ...resume, is_active: resume.id === body.activeResumeId })));
      }
    }
    setWorkingId(null);
  }

  const activeVoiceMode = preferences ? "Browser Web Voice available" : "...";
  const brain = credentials
    ? credentials.brainProvider === "platform"
      ? "Platform default"
      : getModelLabel(credentials.brainModel)
    : "...";

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>{email ?? "No email set"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Display name" />
          <Input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} placeholder="username (lowercase, no spaces)" />
          <Select value={role} onChange={(event) => setRole(event.target.value === "recruiter" ? "recruiter" : "candidate")}>
            <option value="candidate">Candidate / General User</option>
            <option value="recruiter">Recruiter</option>
          </Select>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button onClick={saveProfile} disabled={profileSaving}>{profileSaving ? "Saving..." : "Save profile"}</Button>
            {profileMsg ? <p className="text-sm text-muted-foreground">{profileMsg}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI memory</CardTitle>
          <CardDescription>JobLens reads this when answering questions. Include your name, role, skills, experience level, and goals.</CardDescription>
        </CardHeader>
        <CardContent>
          {!memoryLoaded ? (
            <Skeleton className="h-24" />
          ) : (
            <>
              <Textarea
                rows={8}
                value={memory}
                onChange={(event) => setMemory(event.target.value)}
                maxLength={8000}
                placeholder={"Name: Ravi Kumar\nRole: Full-stack developer\nExperience: 3 years (React, Node.js)\nLooking for: remote senior roles"}
              />
              <p className="mt-1 text-xs text-muted-foreground">{memory.length}/8000 characters</p>
              <Button onClick={saveMemory} disabled={memorySaving} className="mt-3">
                {memorySaving ? "Saving..." : "Save memory"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="outline"><Link href="/dashboard/settings/voice">AI settings</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/billing">Billing</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/resume">Manage resumes</Link></Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Extension</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusLine label="Installed on this browser" value={extension.checking ? "Checking" : extension.installed ? "Connected" : "Not detected"} />
            <StatusLine label="Extension auth" value={extension.installed ? (extension.signedIn ? "Signed in" : "Signed out") : "Unavailable"} />
            <StatusLine label="Backend" value={backendOrigin || "Current dashboard"} />
            <Button type="button" variant="outline" onClick={probeExtension}><RefreshCw className="h-4 w-4" /> Refresh status</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI model and browser voice</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusLine label="Voice mode" value={activeVoiceMode} />
            <StatusLine label="Brain model" value={brain} />
            <StatusLine label="TypeGPT key" value={credentials?.typegptKeyConfigured ? "Configured" : "Platform default"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusLine label="Plan" value={billing?.plan ?? "..."} />
            <StatusLine label="Status" value={billing?.status ?? "..."} />
            <StatusLine label="Renews" value={billing?.renewsAt ?? "Not scheduled"} />
            {billing?.portalUrl ? (
              <Button asChild variant="outline">
                <a href={billing.portalUrl} target="_blank" rel="noopener">Manage subscription</a>
              </Button>
            ) : (
              <Button asChild variant="outline"><Link href="/dashboard/billing">Open billing</Link></Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Resume data</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resumes uploaded.</p>
          ) : (
            resumes.map((resume) => (
              <div key={resume.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="font-medium">{resume.original_filename}</p>
                  <p className="text-sm text-muted-foreground">Experience level: {resume.experience_level ?? "unknown"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {resume.is_active ? <Badge>Active</Badge> : <Button variant="outline" onClick={() => setActive(resume.id)} disabled={workingId === resume.id}>Make active</Button>}
                  <Button variant="outline" onClick={() => deleteResume(resume.id)} disabled={workingId === resume.id}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Privacy controls</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={deleteData}>Delete all JobLens data</Button>
          <Button variant="destructive" onClick={deleteAccount}>Delete account</Button>
        </CardContent>
      </Card>
      {message ? <p className="rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
