import { handleRouteError, json, readJson } from "@/lib/api";
import { parseModelJson } from "@/lib/ai/json";
import { callBrainModel } from "@/lib/ai/modelRouter";
import { requireApiRole } from "@/lib/auth/roles";
import { analyzeJobDeterministic, sanitizePlainText } from "@/lib/recruiter/analysis";
import { recruiterJobInputSchema, structuredRequirementsSchema } from "@/lib/recruiter/schemas";
import type { StructuredRequirements } from "@/lib/recruiter/types";
import { isMissingSupabaseSchemaError } from "@/lib/supabase/schema";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(request, "recruiter");
    if (!auth.ok) return auth.response;
    const user = auth.user;

    const body = recruiterJobInputSchema.parse(await readJson(request));
    const job = {
      ...body,
      description: sanitizePlainText(body.description, 20000),
      experienceMin: normalizeExperience(body.experienceMin),
      experienceMax: normalizeExperience(body.experienceMax)
    };
    const deterministic = analyzeJobDeterministic(job);
    let structuredRequirements: StructuredRequirements = deterministic;
    let warning: string | undefined;
    let modelMeta: unknown;

    try {
      const result = await callBrainModel(user.id, [
        {
          role: "system",
          content:
            "You are JobLens Recruiter AI. Extract hiring requirements for recruiter-side candidate ranking. Do not use or infer protected attributes. Return valid JSON only."
        },
        {
          role: "user",
          content: jobAnalysisPrompt(job, deterministic)
        }
      ]);
      structuredRequirements = (await parseModelJson(result.answer, structuredRequirementsSchema)) as StructuredRequirements;
      modelMeta = result.modelMeta;
    } catch {
      structuredRequirements = deterministic;
      warning = "AI job analysis unavailable; deterministic job understanding shown.";
    }

    const persistence = await saveJob(user.id, job, structuredRequirements);
    warning = [warning, persistence.warning].filter(Boolean).join(" ") || undefined;

    return json({
      jobId: persistence.jobId,
      structuredRequirements,
      warning,
      modelMeta
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

function normalizeExperience(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(60, Math.round(value)));
}

function jobAnalysisPrompt(job: { title?: string; company?: string; location?: string; description: string }, fallback: StructuredRequirements) {
  return `Analyze this recruiter job description for candidate ranking.

Job:
${JSON.stringify(job, null, 2)}

Use this deterministic extraction as a baseline, but improve it if the job text supports it:
${JSON.stringify(fallback, null, 2)}

Return ONLY JSON matching:
{
  "roleSummary": "string",
  "seniorityLevel": "string",
  "coreResponsibilities": ["string"],
  "mustHaveSkills": ["string"],
  "niceToHaveSkills": ["string"],
  "domainKnowledge": ["string"],
  "toolsTechnologies": ["string"],
  "softSkills": ["string"],
  "experienceRequirements": ["string"],
  "disqualifiers": ["string"],
  "scoringWeights": {
    "semanticFit": 30,
    "mustHaveSkills": 25,
    "experience": 15,
    "projects": 10,
    "careerMetadata": 10,
    "activitySignals": 10
  }
}

Rules:
- Base requirements only on job criteria.
- Do not mention or infer age, gender, race, caste, religion, disability, marital status, photo, or other protected attributes.
- Disqualifiers are review flags only, not automatic rejection rules.`;
}

async function saveJob(
  userId: string,
  job: {
    title?: string;
    company?: string;
    location?: string;
    description: string;
    experienceMin?: number;
    experienceMax?: number;
    mustHaveSkills?: string[];
    niceToHaveSkills?: string[];
  },
  structuredRequirements: StructuredRequirements
) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        user_id: userId,
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        experience_min: job.experienceMin,
        experience_max: job.experienceMax,
        must_have_skills: job.mustHaveSkills?.length ? job.mustHaveSkills : structuredRequirements.mustHaveSkills,
        nice_to_have_skills: job.niceToHaveSkills?.length ? job.niceToHaveSkills : structuredRequirements.niceToHaveSkills,
        structured_requirements: structuredRequirements
      })
      .select("id")
      .single();
    if (error) throw error;
    return { jobId: data.id as string | undefined, warning: undefined };
  } catch (error) {
    if (isMissingSupabaseSchemaError(error)) {
      return { jobId: undefined, warning: "Recruiter tables are not applied yet; continuing in demo mode." };
    }
    console.error(error instanceof Error ? error.message : error);
    return { jobId: undefined, warning: "Could not persist the analyzed job; continuing in demo mode." };
  }
}
