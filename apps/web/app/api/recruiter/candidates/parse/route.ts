import { z } from "zod";
import { handleRouteError, json, readJson } from "@/lib/api";
import { requireApiRole } from "@/lib/auth/roles";
import { parseCandidate } from "@/lib/recruiter/parser";
import { candidateSchema } from "@/lib/recruiter/schemas";
import type { ActivitySignals, CandidateProfile, CareerMetadata } from "@/lib/recruiter/types";
import { parseResumeFile } from "@/lib/resume/parser";
import { isMissingSupabaseSchemaError } from "@/lib/supabase/schema";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const jsonCandidateInputSchema = candidateSchema.extend({
  persist: z.boolean().optional()
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(request, "recruiter");
    if (!auth.ok) return auth.response;
    const user = auth.user;

    const contentType = request.headers.get("content-type") ?? "";
    const parsed = contentType.includes("multipart/form-data")
      ? await parseMultipartCandidate(request)
      : parseCandidate(jsonCandidateInputSchema.parse(await readJson(request)));

    const persistence = await saveCandidate(user.id, parsed);

    return json({
      candidate: persistence.candidate ?? parsed,
      warning: persistence.warning
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

async function parseMultipartCandidate(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const fileParsed = file instanceof File ? await parseResumeFile(file) : null;
  const resumeText = String(form.get("resumeText") ?? fileParsed?.parsedText ?? "");
  const activitySignals = parseJsonField(form.get("activitySignals"));
  const careerMetadata = parseJsonField(form.get("careerMetadata"));

  return parseCandidate({
    name: stringField(form.get("name")),
    email: stringField(form.get("email")),
    phone: stringField(form.get("phone")),
    currentRole: stringField(form.get("currentRole")),
    location: stringField(form.get("location")),
    education: stringField(form.get("education")),
    experienceYears: numberField(form.get("experienceYears")),
    resumeText,
    skills: stringField(form.get("skills")) || fileParsed?.skills || [],
    projects: stringField(form.get("projects")) || fileParsed?.projects || [],
    careerMetadata: {
      ...(careerMetadata && typeof careerMetadata === "object" ? careerMetadata : {}),
      source: file instanceof File ? "upload" : "manual"
    },
    activitySignals: activitySignals && typeof activitySignals === "object" ? activitySignals : undefined
  });
}

function stringField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function numberField(value: FormDataEntryValue | null) {
  const text = stringField(value);
  if (!text) return undefined;
  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
}

function parseJsonField(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

async function saveCandidate(userId: string, candidate: CandidateProfile) {
  if (candidate.isDemo) return { candidate, warning: undefined };
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("candidates")
      .insert({
        user_id: userId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        resume_text: candidate.resumeText,
        skills: candidate.skills,
        experience_years: candidate.experienceYears,
        current_role: candidate.currentRole,
        location: candidate.location,
        education: candidate.education,
        projects: candidate.projects,
        career_metadata: candidate.careerMetadata ?? {},
        activity_signals: candidate.activitySignals ?? {}
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      candidate: mapCandidateRow(data),
      warning: undefined
    };
  } catch (error) {
    if (isMissingSupabaseSchemaError(error)) {
      return { candidate, warning: "Recruiter tables are not applied yet; candidate is available in this session only." };
    }
    console.error(error instanceof Error ? error.message : error);
    return { candidate, warning: "Could not persist candidate; candidate is available in this session only." };
  }
}

function mapCandidateRow(row: Record<string, unknown>): CandidateProfile {
  return {
    id: String(row.id),
    name: String(row.name ?? "Unnamed Candidate"),
    email: typeof row.email === "string" ? row.email : null,
    phone: typeof row.phone === "string" ? row.phone : null,
    resumeText: typeof row.resume_text === "string" ? row.resume_text : "",
    skills: Array.isArray(row.skills) ? row.skills.map(String) : [],
    experienceYears: typeof row.experience_years === "number" ? row.experience_years : Number(row.experience_years ?? 0) || null,
    currentRole: typeof row.current_role === "string" ? row.current_role : null,
    location: typeof row.location === "string" ? row.location : null,
    education: typeof row.education === "string" ? row.education : null,
    projects: Array.isArray(row.projects) ? row.projects.map(String) : [],
    careerMetadata: row.career_metadata && typeof row.career_metadata === "object" ? (row.career_metadata as CareerMetadata) : {},
    activitySignals: row.activity_signals && typeof row.activity_signals === "object" ? (row.activity_signals as ActivitySignals) : {},
    isDemo: false
  };
}
