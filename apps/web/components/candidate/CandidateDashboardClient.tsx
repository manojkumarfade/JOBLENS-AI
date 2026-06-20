"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Chrome, FileText, Mic, RefreshCw, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/lib/auth/clientFetch";
import { ExtensionLinksCard } from "./ExtensionLinksCard";

type ExtensionStatus = {
  checking: boolean;
  installed: boolean;
  signedIn: boolean;
};

type ResumeStatus = {
  id: string;
  original_filename: string;
  experience_level?: string | null;
  skills?: string[];
} | null;

type AnalysisView = {
  id: string;
  roleTitle?: string | null;
  companyName?: string | null;
  matchScore?: number | null;
  summary?: string | null;
};

export function CandidateDashboardClient({
  resume,
  analyses,
  backendUrl,
  profile,
  tutorialSeen
}: {
  resume: ResumeStatus;
  analyses: AnalysisView[];
  backendUrl: string;
  profile: { name: string | null; email: string | null; createdAt: string | null };
  tutorialSeen: boolean;
}) {
  const [extension, setExtension] = useState<ExtensionStatus>({ checking: true, installed: false, signedIn: false });
  const [voiceMessage, setVoiceMessage] = useState("");
  const [showTutorial, setShowTutorial] = useState(!tutorialSeen);

  useEffect(() => {
    probeExtension();
  }, []);

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

  function testVoice() {
    if (!("speechSynthesis" in window)) {
      setVoiceMessage("Browser voice output is unavailable. Use Chrome or Edge.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("JobLens voice output is working.");
    utterance.onstart = () => setVoiceMessage("Speaking test sentence...");
    utterance.onend = () => setVoiceMessage("Voice output works.");
    utterance.onerror = () => setVoiceMessage("Voice output failed. Check browser audio permissions.");
    window.speechSynthesis.speak(utterance);
  }

  async function dismissTutorial() {
    setShowTutorial(false);
    await authFetch("/api/onboarding/tutorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: "candidate" })
    }).catch(() => null);
  }

  return (
    <div className="space-y-6">
      <section>
        <Badge variant="secondary">JobLens AI Browser Copilot</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold">Summarize any webpage by voice.</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Connect the Chrome extension, upload your resume for job-fit analysis, then ask questions on any normal webpage.
        </p>
      </section>

      {showTutorial ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>First-time setup</CardTitle>
            <CardDescription>Finish these steps once to use the Browser Copilot smoothly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="grid gap-2 text-muted-foreground">
              <li>1. Upload or confirm your active personal resume.</li>
              <li>2. Open the extension popup and click &quot;Sign in with dashboard Google account.&quot;</li>
              <li>3. Open any webpage, click the floating button, and ask &quot;Summarize this page.&quot;</li>
            </ol>
            <Button type="button" onClick={dismissTutorial}>Got it</Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
          <CardDescription>Candidate/general user profile used for personal resume and browser copilot flows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <StatusLine label="Name" value={profile.name ?? "Not set"} />
          <StatusLine label="Email" value={profile.email ?? "Not set"} />
          <StatusLine label="Joined" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown"} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Chrome className="h-5 w-5" /> Extension Status</CardTitle>
            <CardDescription>Use the extension on articles, documentation, job pages, and recruiter pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusLine label="Installed" value={extension.checking ? "Checking" : extension.installed ? "Detected" : "Not detected"} />
            <StatusLine label="Signed in" value={extension.installed ? (extension.signedIn ? "Yes" : "No") : "Unavailable"} />
            <StatusLine label="Backend URL" value={backendUrl} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={probeExtension}><RefreshCw className="h-4 w-4" /> Refresh</Button>
              <Button asChild variant="outline"><Link href="/install-extension">Install instructions</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Resume Status</CardTitle>
            <CardDescription>Resume is optional for webpage summaries, required for personal job-fit questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {resume ? (
              <>
                <StatusLine label="Active resume" value={resume.original_filename} />
                <StatusLine label="Experience" value={resume.experience_level ?? "unknown"} />
                <div className="flex flex-wrap gap-1">
                  {(resume.skills ?? []).slice(0, 8).map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
                </div>
              </>
            ) : (
              <p className="rounded-md border bg-muted/40 p-3 text-muted-foreground">No active resume uploaded yet.</p>
            )}
            <Button asChild><Link href="/dashboard/candidate/resume">{resume ? "Manage resume" : "Upload resume"}</Link></Button>
          </CardContent>
        </Card>
      </div>

      <ExtensionLinksCard />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Voice Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusLine label="Mode" value="Browser Web Voice" />
            <p className="text-muted-foreground">If mic does not work, allow microphone permission for the current site and use Chrome or Edge.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={testVoice}><Volume2 className="h-4 w-4" /> Test Voice Output</Button>
              <Button asChild variant="outline"><Link href="/dashboard/settings/voice">AI/GPT Settings</Link></Button>
            </div>
            {voiceMessage ? <p className="rounded-md border bg-muted p-2">{voiceMessage}</p> : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-2 text-sm text-muted-foreground">
              <li>1. Install or reload the Chrome extension.</li>
              <li>2. Sign in from the extension popup.</li>
              <li>3. Open any webpage.</li>
              <li>4. Click the floating voice button.</li>
              <li>5. Ask: &quot;Summarize this page.&quot;</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage / History</CardTitle>
          <CardDescription>Recent saved page summaries and job-fit analyses.</CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {analyses.slice(0, 4).map((analysis) => (
                <div key={analysis.id} className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">{analysis.roleTitle ?? "Saved page analysis"}</p>
                  <p className="text-muted-foreground">{analysis.companyName ?? analysis.summary ?? "Analysis saved from JobLens."}</p>
                  {typeof analysis.matchScore === "number" ? <Badge className="mt-2">{analysis.matchScore}% match</Badge> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
              No saved history yet. You can use temporary voice summaries without storing transcripts.
            </p>
          )}
        </CardContent>
      </Card>
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
