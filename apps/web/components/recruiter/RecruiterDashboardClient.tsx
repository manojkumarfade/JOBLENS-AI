"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  ClipboardCopy,
  FileUp,
  ListFilter,
  Loader2,
  Plus,
  Sparkles,
  Users
} from "lucide-react";
import { demoCandidates, demoJob } from "@/lib/recruiter/demoData";
import type { CandidateProfile, FitLabel, RankedCandidate, RecruiterJobInput, StructuredRequirements } from "@/lib/recruiter/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type JobForm = {
  title: string;
  company: string;
  location: string;
  experienceMin: string;
  experienceMax: string;
  description: string;
  mustHaveSkills: string;
  niceToHaveSkills: string;
  salaryRange: string;
  workMode: string;
};

type ManualCandidate = {
  name: string;
  email: string;
  currentRole: string;
  experienceYears: string;
  location: string;
  skills: string;
  projects: string;
  resumeText: string;
};

type RankingApiResponse = {
  jobUnderstanding: StructuredRequirements;
  rankedCandidates: RankedCandidate[];
  fairnessNote: string;
  warning?: string;
};

const fitLabels: Array<FitLabel | "all"> = ["all", "Excellent Fit", "Strong Fit", "Moderate Fit", "Weak Fit"];

export function RecruiterDashboardClient() {
  const [job, setJob] = useState<JobForm>(() => ({
    title: demoJob.title ?? "",
    company: demoJob.company ?? "",
    location: demoJob.location ?? "",
    experienceMin: String(demoJob.experienceMin ?? ""),
    experienceMax: String(demoJob.experienceMax ?? ""),
    description: demoJob.description,
    mustHaveSkills: (demoJob.mustHaveSkills ?? []).join(", "),
    niceToHaveSkills: (demoJob.niceToHaveSkills ?? []).join(", "),
    salaryRange: demoJob.salaryRange ?? "",
    workMode: String(demoJob.workMode ?? "")
  }));
  const [jobId, setJobId] = useState<string | undefined>();
  const [structured, setStructured] = useState<StructuredRequirements | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[]>(demoCandidates);
  const [ranked, setRanked] = useState<RankedCandidate[]>([]);
  const [selected, setSelected] = useState<RankedCandidate | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const [minScore, setMinScore] = useState("0");
  const [skillFilter, setSkillFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState<(typeof fitLabels)[number]>("all");
  const [sortBy, setSortBy] = useState("score");
  const [manual, setManual] = useState<ManualCandidate>({
    name: "",
    email: "",
    currentRole: "",
    experienceYears: "",
    location: "",
    skills: "",
    projects: "",
    resumeText: ""
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stats = useMemo(() => {
    const shortlisted = ranked.filter((candidate) => candidate.overallScore >= 70).length;
    const average = ranked.length
      ? Math.round(ranked.reduce((sum, candidate) => sum + candidate.overallScore, 0) / ranked.length)
      : 0;
    return [
      { label: "Total Candidates", value: String(candidates.length), icon: Users },
      { label: "Jobs Created", value: jobId || structured ? "1" : "0", icon: BriefcaseBusiness },
      { label: "Shortlisted Candidates", value: String(shortlisted), icon: Sparkles },
      { label: "Average Match Score", value: ranked.length ? `${average}%` : "--", icon: BarChart3 }
    ];
  }, [candidates.length, jobId, ranked, structured]);

  const filteredRanked = useMemo(() => {
    const minimum = Number(minScore) || 0;
    const skill = skillFilter.trim().toLowerCase();
    const filtered = ranked.filter((candidate) => {
      const candidateSkills = candidate.candidate.skills.join(" ").toLowerCase();
      const matchesScore = candidate.overallScore >= minimum;
      const matchesSkill = !skill || candidateSkills.includes(skill) || candidate.evidence.join(" ").toLowerCase().includes(skill);
      const matchesLabel = labelFilter === "all" || candidate.label === labelFilter;
      const experience = candidate.candidate.experienceYears ?? 0;
      const matchesExperience =
        experienceFilter === "all" ||
        (experienceFilter === "0-2" && experience <= 2) ||
        (experienceFilter === "3-5" && experience >= 3 && experience <= 5) ||
        (experienceFilter === "6+" && experience >= 6);
      return matchesScore && matchesSkill && matchesLabel && matchesExperience;
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "experience") return (b.candidate.experienceYears ?? 0) - (a.candidate.experienceYears ?? 0);
      if (sortBy === "name") return a.candidate.name.localeCompare(b.candidate.name);
      return b.overallScore - a.overallScore;
    });
  }, [experienceFilter, labelFilter, minScore, ranked, skillFilter, sortBy]);

  async function analyzeJob() {
    setAnalyzing(true);
    setMessage("Analyzing job requirements...");
    setWarning("");
    const res = await fetch("/api/recruiter/jobs/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toJobPayload(job))
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setStructured(data.structuredRequirements);
      setJobId(data.jobId);
      setWarning(data.warning ?? "");
      setMessage("Job analysis ready.");
    } else {
      setMessage(data?.error?.message ?? "Could not analyze job.");
    }
    setAnalyzing(false);
  }

  async function rankCandidatePool() {
    setRanking(true);
    setMessage("Ranking candidates...");
    setWarning("");
    const payload = toJobPayload(job);
    const res = await fetch("/api/recruiter/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        jobDescription: payload.description,
        job: payload,
        structuredRequirements: structured ?? undefined,
        candidates
      })
    });
    const data = (await res.json().catch(() => null)) as RankingApiResponse | { error?: { message?: string } } | null;
    if (res.ok && data && "rankedCandidates" in data) {
      setStructured(data.jobUnderstanding);
      setRanked(data.rankedCandidates);
      setSelected(data.rankedCandidates[0] ?? null);
      setWarning(data.warning ?? data.fairnessNote);
      setMessage("Ranked shortlist generated.");
    } else {
      setMessage(data && "error" in data ? data.error?.message ?? "Could not rank candidates." : "Could not rank candidates.");
    }
    setRanking(false);
  }

  async function uploadCandidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!(form.get("file") instanceof File)) return;
    setUploading(true);
    setMessage("Parsing candidate resume...");
    const res = await fetch("/api/recruiter/candidates/parse", { method: "POST", body: form });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setCandidates((current) => [data.candidate, ...current]);
      setWarning(data.warning ?? "");
      setMessage("Candidate parsed and added.");
      event.currentTarget.reset();
    } else {
      setMessage(data?.error?.message ?? "Could not parse candidate.");
    }
    setUploading(false);
  }

  async function addManualCandidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Adding candidate...");
    const res = await fetch("/api/recruiter/candidates/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...manual,
        experienceYears: manual.experienceYears ? Number(manual.experienceYears) : undefined,
        skills: manual.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        projects: manual.projects.split("\n").map((project) => project.trim()).filter(Boolean),
        careerMetadata: { source: "manual" },
        activitySignals: {
          profileCompleteness: 72,
          recentActivityScore: 65,
          assessmentScore: 70,
          responseSpeedScore: 65,
          portfolioAvailable: /portfolio|http/i.test(manual.resumeText),
          githubAvailable: /github/i.test(manual.resumeText),
          applicationFreshness: 80,
          communicationScore: 70
        }
      })
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setCandidates((current) => [data.candidate, ...current]);
      setWarning(data.warning ?? "");
      setManual({ name: "", email: "", currentRole: "", experienceYears: "", location: "", skills: "", projects: "", resumeText: "" });
      setMessage("Manual candidate added.");
    } else {
      setMessage(data?.error?.message ?? "Could not add candidate.");
    }
  }

  async function copyShortlist() {
    const rows = filteredRanked.slice(0, 8).map((candidate) => {
      return `${candidate.rank}. ${candidate.candidate.name} - ${candidate.overallScore}/100 (${candidate.label})\nTop reason: ${candidate.topReason}\nNext step: ${candidate.recommendedAction}`;
    });
    const summary = [
      "JobLens Recruiter AI shortlist",
      `${job.title || "Untitled role"}${job.company ? ` at ${job.company}` : ""}`,
      "",
      ...rows,
      "",
      "Human review required before any hiring decision."
    ].join("\n");
    await navigator.clipboard.writeText(summary);
    setMessage("Shortlist summary copied.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge variant="secondary">JobLens Recruiter AI</Badge>
            <h1 className="mt-3 font-display text-3xl font-bold">AI-powered candidate ranking and shortlisting engine</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Go beyond keyword filtering. Understand the job, analyze candidate fit, integrate career and activity signals, and generate an explainable ranked shortlist in seconds.
            </p>
          </div>
          <Button onClick={rankCandidatePool} disabled={ranking || candidates.length === 0} className="lg:mt-8">
            {ranking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {ranking ? "Ranking..." : "Rank Candidates"}
          </Button>
        </div>
        <div className="mt-5 rounded-md border border-amber-300/60 bg-amber-50 p-3 text-sm leading-6 text-amber-950 dark:bg-amber-950/25 dark:text-amber-100">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          This tool is an AI decision-support assistant. It should not be used as the sole basis for hiring decisions. Recruiters must review explanations and candidate evidence before making decisions.
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A. Job Description Input</CardTitle>
              <CardDescription>Analyze the role before ranking candidates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Job title"><Input value={job.title} onChange={(event) => updateJob("title", event.target.value)} /></Field>
                <Field label="Company"><Input value={job.company} onChange={(event) => updateJob("company", event.target.value)} /></Field>
                <Field label="Location"><Input value={job.location} onChange={(event) => updateJob("location", event.target.value)} /></Field>
                <Field label="Work mode">
                  <Select value={job.workMode} onChange={(event) => updateJob("workMode", event.target.value)}>
                    <option value="">Not specified</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </Select>
                </Field>
                <Field label="Experience min"><Input type="number" min="0" value={job.experienceMin} onChange={(event) => updateJob("experienceMin", event.target.value)} /></Field>
                <Field label="Experience max"><Input type="number" min="0" value={job.experienceMax} onChange={(event) => updateJob("experienceMax", event.target.value)} /></Field>
                <Field label="Must-have skills"><Input value={job.mustHaveSkills} onChange={(event) => updateJob("mustHaveSkills", event.target.value)} /></Field>
                <Field label="Nice-to-have skills"><Input value={job.niceToHaveSkills} onChange={(event) => updateJob("niceToHaveSkills", event.target.value)} /></Field>
                <Field label="Salary range optional"><Input value={job.salaryRange} onChange={(event) => updateJob("salaryRange", event.target.value)} /></Field>
              </div>
              <Field label="Job description">
                <Textarea rows={10} value={job.description} onChange={(event) => updateJob("description", event.target.value)} />
              </Field>
              <Button onClick={analyzeJob} disabled={analyzing || job.description.trim().length < 20}>
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {analyzing ? "Analyzing..." : "Analyze Job"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>B. Candidate Pool</CardTitle>
              <CardDescription>Use demo candidates, add candidates manually, or upload resumes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={uploadCandidate} className="grid gap-3 rounded-md border bg-muted/30 p-3 md:grid-cols-[1fr_auto]">
                <Input ref={fileInputRef} name="file" type="file" accept=".pdf,.docx,.txt" />
                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                  Upload Resume
                </Button>
              </form>

              <form onSubmit={addManualCandidate} className="grid gap-3 rounded-md border p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Name"><Input required value={manual.name} onChange={(event) => updateManual("name", event.target.value)} /></Field>
                  <Field label="Email"><Input type="email" value={manual.email} onChange={(event) => updateManual("email", event.target.value)} /></Field>
                  <Field label="Current role"><Input value={manual.currentRole} onChange={(event) => updateManual("currentRole", event.target.value)} /></Field>
                  <Field label="Experience years"><Input type="number" min="0" value={manual.experienceYears} onChange={(event) => updateManual("experienceYears", event.target.value)} /></Field>
                  <Field label="Location"><Input value={manual.location} onChange={(event) => updateManual("location", event.target.value)} /></Field>
                  <Field label="Skills"><Input placeholder="React, Node.js, Postgres" value={manual.skills} onChange={(event) => updateManual("skills", event.target.value)} /></Field>
                </div>
                <Field label="Projects"><Textarea rows={3} value={manual.projects} onChange={(event) => updateManual("projects", event.target.value)} /></Field>
                <Field label="Pasted resume text"><Textarea rows={4} value={manual.resumeText} onChange={(event) => updateManual("resumeText", event.target.value)} /></Field>
                <Button type="submit" variant="outline"><Plus className="h-4 w-4" /> Add Candidate Manually</Button>
              </form>

              <div className="grid gap-3">
                {candidates.slice(0, 8).map((candidate) => (
                  <div key={candidate.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.currentRole ?? "Role unclear"} · {candidate.experienceYears ?? "?"} yrs</p>
                      </div>
                      {candidate.isDemo ? <Badge variant="secondary">Demo</Badge> : <Badge>Added</Badge>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 7).map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <JobAnalysisCard structured={structured} />

          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>C. AI Ranking Panel</CardTitle>
                  <CardDescription>Ranked shortlist with filters, score breakdowns, and next steps.</CardDescription>
                </div>
                <Button variant="outline" onClick={copyShortlist} disabled={!filteredRanked.length}>
                  <ClipboardCopy className="h-4 w-4" /> Copy Shortlist Summary
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-5">
                <Input type="number" min="0" max="100" value={minScore} onChange={(event) => setMinScore(event.target.value)} aria-label="Minimum score" />
                <Input value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} placeholder="Skill filter" />
                <Select value={experienceFilter} onChange={(event) => setExperienceFilter(event.target.value)} aria-label="Experience filter">
                  <option value="all">All experience</option>
                  <option value="0-2">0-2 yrs</option>
                  <option value="3-5">3-5 yrs</option>
                  <option value="6+">6+ yrs</option>
                </Select>
                <Select value={labelFilter} onChange={(event) => setLabelFilter(event.target.value as typeof labelFilter)} aria-label="Fit filter">
                  {fitLabels.map((label) => <option key={label} value={label}>{label === "all" ? "All labels" : label}</option>)}
                </Select>
                <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort">
                  <option value="score">Sort by score</option>
                  <option value="experience">Sort by experience</option>
                  <option value="name">Sort by name</option>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {ranked.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[840px] text-left text-sm">
                    <thead className="border-b text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="py-3 pr-3">Rank</th>
                        <th className="py-3 pr-3">Candidate</th>
                        <th className="py-3 pr-3">Current Role</th>
                        <th className="py-3 pr-3">Experience</th>
                        <th className="py-3 pr-3">Key Skills</th>
                        <th className="py-3 pr-3">Match Score</th>
                        <th className="py-3 pr-3">Label</th>
                        <th className="py-3 pr-3">Top Reason</th>
                        <th className="py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRanked.map((candidate) => (
                        <tr key={candidate.candidateId} className="border-b last:border-0">
                          <td className="py-3 pr-3 font-semibold">#{candidate.rank}</td>
                          <td className="py-3 pr-3">
                            <div className="font-medium">{candidate.candidate.name}</div>
                            <div className="text-xs text-muted-foreground">{candidate.candidate.isDemo ? "Demo candidate" : candidate.candidate.email ?? "Added candidate"}</div>
                          </td>
                          <td className="py-3 pr-3">{candidate.candidate.currentRole ?? "Unclear"}</td>
                          <td className="py-3 pr-3">{candidate.candidate.experienceYears ?? "?"} yrs</td>
                          <td className="py-3 pr-3">
                            <div className="flex max-w-44 flex-wrap gap-1">
                              {candidate.candidate.skills.slice(0, 4).map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
                            </div>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="min-w-28">
                              <ProgressBar value={candidate.overallScore} />
                              <p className="mt-1 font-semibold">{candidate.overallScore}/100</p>
                            </div>
                          </td>
                          <td className="py-3 pr-3"><FitBadge label={candidate.label} /></td>
                          <td className="max-w-56 py-3 pr-3 text-muted-foreground">{candidate.topReason}</td>
                          <td className="py-3">
                            <Button size="sm" variant="outline" onClick={() => setSelected(candidate)}>Details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-md border bg-muted/30 p-8 text-center text-muted-foreground">
                  <ListFilter className="mx-auto mb-3 h-8 w-8" />
                  Analyze the job and rank candidates to generate an explainable shortlist.
                </div>
              )}
            </CardContent>
          </Card>

          <CandidateDetails selected={selected} />
        </div>
      </div>

      {(message || warning) ? (
        <div className="rounded-md border bg-muted p-3 text-sm">
          {message ? <p>{message}</p> : null}
          {warning ? <p className="mt-1 text-muted-foreground">{warning}</p> : null}
        </div>
      ) : null}
    </div>
  );

  function updateJob<Key extends keyof JobForm>(key: Key, value: JobForm[Key]) {
    setJob((current) => ({ ...current, [key]: value }));
  }

  function updateManual<Key extends keyof ManualCandidate>(key: Key, value: ManualCandidate[Key]) {
    setManual((current) => ({ ...current, [key]: value }));
  }
}

function toJobPayload(job: JobForm): RecruiterJobInput {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    experienceMin: numberOrUndefined(job.experienceMin),
    experienceMax: numberOrUndefined(job.experienceMax),
    description: job.description,
    mustHaveSkills: splitCsv(job.mustHaveSkills),
    niceToHaveSkills: splitCsv(job.niceToHaveSkills),
    salaryRange: job.salaryRange,
    workMode: job.workMode
  };
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function numberOrUndefined(value: string) {
  const number = Number(value);
  return Number.isFinite(number) && value.trim() ? number : undefined;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function JobAnalysisCard({ structured }: { structured: StructuredRequirements | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Analysis Card</CardTitle>
        <CardDescription>Deep job understanding used by the ranking engine.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {structured ? (
          <>
            <p className="text-sm leading-6">{structured.roleSummary}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <AnalysisChips title="Must-have skills" items={structured.mustHaveSkills} />
              <AnalysisChips title="Nice-to-have skills" items={structured.niceToHaveSkills} />
              <AnalysisChips title="Seniority" items={[structured.seniorityLevel]} />
              <AnalysisChips title="Responsibilities" items={structured.coreResponsibilities.slice(0, 4)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Scoring weights</p>
              <div className="grid gap-2">
                {Object.entries(structured.scoringWeights).map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[140px_1fr_42px] items-center gap-3 text-sm">
                    <span className="capitalize text-muted-foreground">{label.replace(/([A-Z])/g, " $1")}</span>
                    <ProgressBar value={value} />
                    <span className="font-medium">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="rounded-md border bg-muted/30 p-5 text-sm text-muted-foreground">Run Analyze Job to extract must-have skills, seniority, responsibilities, and scoring weights.</p>
        )}
      </CardContent>
    </Card>
  );
}

function AnalysisChips({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {items.length ? items.map((item) => <Badge key={item} variant="secondary">{item}</Badge>) : <span className="text-sm text-muted-foreground">Not detected</span>}
      </div>
    </div>
  );
}

function CandidateDetails({ selected }: { selected: RankedCandidate | null }) {
  if (!selected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>D. Explanation / Details Drawer</CardTitle>
          <CardDescription>Select a candidate row to inspect evidence and score breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">No candidate selected yet.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>D. {selected.candidate.name}</CardTitle>
            <CardDescription>{selected.candidate.currentRole ?? "Role unclear"} · {selected.overallScore}/100 · {selected.label}</CardDescription>
          </div>
          <FitBadge label={selected.label} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 text-sm leading-6">
        <p>{selected.explanation}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(selected.scoreBreakdown).map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between gap-3 text-xs font-medium uppercase text-muted-foreground">
                <span>{label.replace(/([A-Z])/g, " $1")}</span>
                <span>{value}</span>
              </div>
              <ProgressBar value={label === "riskPenalty" ? 100 - value : value} />
            </div>
          ))}
        </div>
        <DetailList title="Matched evidence" items={selected.evidence} />
        <DetailList title="Missing requirements" items={selected.missingSignals} />
        <DetailList title="Concerns / risks" items={selected.concerns} />
        <DetailList title="Interview questions" items={selected.interviewQuestions} />
        <div className="rounded-md border bg-muted/40 p-3">
          <p className="font-semibold">Recommended next step</p>
          <p className="mt-1 text-muted-foreground">{selected.recommendedAction}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-inside list-disc text-muted-foreground">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No items detected.</li>}
      </ul>
    </section>
  );
}

function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${safe}%` }} />
    </div>
  );
}

function FitBadge({ label }: { label: FitLabel }) {
  const variant = label === "Weak Fit" ? "outline" : label === "Moderate Fit" ? "secondary" : "default";
  return <Badge variant={variant}>{label}</Badge>;
}
