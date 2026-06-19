import { handleRouteError, json, readJson } from "@/lib/api";
import { parseModelJson } from "@/lib/ai/json";
import { callBrainModel } from "@/lib/ai/modelRouter";
import { requireApiRole } from "@/lib/auth/roles";
import { analyzeJobDeterministic, sanitizePlainText } from "@/lib/recruiter/analysis";
import { parseCandidate } from "@/lib/recruiter/parser";
import { rankCandidates } from "@/lib/recruiter/ranking";
import { aiRankingEnhancementSchema, rankRequestSchema } from "@/lib/recruiter/schemas";
import type { AiRankingEnhancement } from "@/lib/recruiter/ranking";
import type { RecruiterJobInput, StructuredRequirements } from "@/lib/recruiter/types";
import { isMissingSupabaseSchemaError } from "@/lib/supabase/schema";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(request, "recruiter");
    if (!auth.ok) return auth.response;
    const user = auth.user;

    const body = rankRequestSchema.parse(await readJson(request));
    const job: RecruiterJobInput = {
      ...body.job,
      id: body.jobId ?? body.job?.id,
      description: sanitizePlainText(body.job?.description ?? body.jobDescription, 20000)
    };
    const candidates = body.candidates.map((candidate) => parseCandidate(candidate));
    const structuredRequirements = (body.structuredRequirements as StructuredRequirements | undefined) ?? analyzeJobDeterministic(job);
    const baseRanking = rankCandidates({ job, structuredRequirements, candidates });
    let warning: string | undefined;
    let enhancements: AiRankingEnhancement[] = [];

    try {
      const result = await callBrainModel(user.id, [
        {
          role: "system",
          content:
            "You are JobLens Recruiter AI. Improve candidate ranking explanations for a human recruiter. Use only supplied job and candidate evidence. Do not use or infer protected attributes. Return valid JSON only."
        },
        {
          role: "user",
          content: rankingEnhancementPrompt(job, structuredRequirements, baseRanking.rankedCandidates)
        }
      ]);
      enhancements = (await parseModelJson(result.answer, aiRankingEnhancementSchema)).rankedCandidates;
    } catch {
      warning = "AI explanation unavailable; deterministic ranking shown.";
    }

    const finalRanking = rankCandidates({ job, structuredRequirements, candidates, aiEnhancements: enhancements });
    const persistence = await saveRankings(user.id, body.jobId, finalRanking.rankedCandidates);
    warning = [warning, persistence.warning].filter(Boolean).join(" ") || undefined;

    return json({
      ...finalRanking,
      warning
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

function rankingEnhancementPrompt(
  job: RecruiterJobInput,
  structuredRequirements: StructuredRequirements,
  rankedCandidates: ReturnType<typeof rankCandidates>["rankedCandidates"]
) {
  const compactCandidates = rankedCandidates.map((candidate) => ({
    candidateId: candidate.candidateId,
    name: candidate.candidate.name,
    currentRole: candidate.candidate.currentRole,
    experienceYears: candidate.candidate.experienceYears,
    skills: candidate.candidate.skills,
    projects: candidate.candidate.projects.slice(0, 3),
    careerMetadata: candidate.candidate.careerMetadata,
    activitySignals: candidate.candidate.activitySignals,
    deterministicScore: candidate.overallScore,
    deterministicBreakdown: candidate.scoreBreakdown,
    matchedSignals: candidate.matchedSignals,
    missingSignals: candidate.missingSignals
  }));

  return `Improve semantic fit, explanations, concerns, recommended action, and interview questions for this ranked shortlist.

Job:
${JSON.stringify(job, null, 2)}

Structured requirements:
${JSON.stringify(structuredRequirements, null, 2)}

Deterministic ranking:
${JSON.stringify(compactCandidates, null, 2)}

Return ONLY JSON:
{
  "rankedCandidates": [
    {
      "candidateId": "string",
      "semanticScore": 0,
      "explanation": "string",
      "concerns": ["string"],
      "interviewQuestions": ["string"],
      "recommendedAction": "string"
    }
  ]
}

Rules:
- Use only the supplied job and candidate evidence.
- Do not invent projects, companies, degrees, skills, or activity signals.
- Do not use gender, religion, caste, race, age, disability, marital status, photo, or any sensitive category.
- Do not automatically reject candidates. Use human-review wording.
- If evidence is weak, say it is unclear and should be verified.`;
}

async function saveRankings(
  userId: string,
  jobId: string | undefined,
  rankedCandidates: ReturnType<typeof rankCandidates>["rankedCandidates"]
) {
  if (!jobId) return { warning: undefined };
  const rows = rankedCandidates
    .filter((candidate) => !candidate.candidate.isDemo && isUuid(candidate.candidateId))
    .map((candidate) => ({
      user_id: userId,
      job_id: jobId,
      candidate_id: candidate.candidateId,
      overall_score: candidate.overallScore,
      semantic_score: candidate.scoreBreakdown.semanticFit,
      must_have_score: candidate.scoreBreakdown.mustHaveSkills,
      experience_score: candidate.scoreBreakdown.experience,
      project_score: candidate.scoreBreakdown.projects,
      activity_score: candidate.scoreBreakdown.activitySignals,
      risk_score: candidate.scoreBreakdown.riskPenalty,
      score_breakdown: candidate.scoreBreakdown,
      matched_signals: candidate.matchedSignals,
      missing_signals: candidate.missingSignals,
      explanation: candidate.explanation,
      interview_questions: candidate.interviewQuestions,
      rank_position: candidate.rank
    }));
  if (!rows.length) return { warning: undefined };

  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("candidate_rankings").insert(rows);
    if (error) throw error;
    return { warning: undefined };
  } catch (error) {
    if (isMissingSupabaseSchemaError(error)) {
      return { warning: "Recruiter ranking tables are not applied yet; rankings were not persisted." };
    }
    console.error(error instanceof Error ? error.message : error);
    return { warning: "Could not persist rankings; shortlist is still available in this session." };
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
