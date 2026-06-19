import { analyzeJobDeterministic, normalizeSkill, RECRUITER_FAIRNESS_NOTE, uniqueStrings } from "./analysis";
import { candidateText } from "./parser";
import type {
  ActivitySignals,
  CandidateProfile,
  FitLabel,
  RankedCandidate,
  RecruiterJobInput,
  ScoreBreakdown,
  StructuredRequirements
} from "./types";

const WEIGHTS = {
  semanticFit: 0.3,
  mustHaveSkills: 0.25,
  experience: 0.15,
  projects: 0.1,
  careerMetadata: 0.1,
  activitySignals: 0.1
};

export interface AiRankingEnhancement {
  candidateId: string;
  semanticScore?: number;
  explanation?: string;
  concerns?: string[];
  interviewQuestions?: string[];
  recommendedAction?: string;
}

export function rankCandidates(input: {
  job: RecruiterJobInput;
  structuredRequirements?: StructuredRequirements | null;
  candidates: CandidateProfile[];
  aiEnhancements?: AiRankingEnhancement[];
}) {
  const structured = input.structuredRequirements ?? analyzeJobDeterministic(input.job);
  const enhancements = new Map((input.aiEnhancements ?? []).map((item) => [item.candidateId, item]));
  const ranked = input.candidates
    .map((candidate) => scoreCandidate(input.job, structured, candidate, enhancements.get(candidate.id)))
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((candidate, index) => ({
      ...candidate,
      rank: index + 1
    }));

  return {
    jobUnderstanding: structured,
    rankedCandidates: ranked,
    fairnessNote: RECRUITER_FAIRNESS_NOTE
  };
}

export function scoreCandidate(
  job: RecruiterJobInput,
  structured: StructuredRequirements,
  candidate: CandidateProfile,
  enhancement?: AiRankingEnhancement
): RankedCandidate {
  const matchedSkills = matchedMustHaveSkills(structured, candidate);
  const missingSkills = missingMustHaveSkills(structured, candidate);
  const semanticFit = clampScore(enhancement?.semanticScore ?? semanticFitScore(job, structured, candidate));
  const mustHaveSkills = mustHaveScore(structured, candidate);
  const experience = experienceScore(job, structured, candidate);
  const projects = projectScore(structured, candidate);
  const careerMetadata = careerMetadataScore(job, structured, candidate);
  const activitySignals = activityScore(candidate.activitySignals);
  const riskPenalty = riskPenaltyScore(job, structured, candidate, missingSkills);
  const overallScore = clampScore(
    semanticFit * WEIGHTS.semanticFit +
      mustHaveSkills * WEIGHTS.mustHaveSkills +
      experience * WEIGHTS.experience +
      projects * WEIGHTS.projects +
      careerMetadata * WEIGHTS.careerMetadata +
      activitySignals * WEIGHTS.activitySignals -
      riskPenalty
  );
  const scoreBreakdown: ScoreBreakdown = {
    semanticFit,
    mustHaveSkills,
    experience,
    projects,
    careerMetadata,
    activitySignals,
    riskPenalty
  };
  const evidence = evidenceFromCandidate(candidate, matchedSkills);
  const concerns = enhancement?.concerns?.length
    ? enhancement.concerns
    : buildConcerns(job, candidate, missingSkills, riskPenalty);
  const interviewQuestions = enhancement?.interviewQuestions?.length
    ? enhancement.interviewQuestions.slice(0, 5)
    : buildInterviewQuestions(structured, candidate, missingSkills);
  const label = fitLabel(overallScore);
  const topReason = buildTopReason(candidate, matchedSkills, scoreBreakdown);

  return {
    candidateId: candidate.id,
    candidate,
    rank: 0,
    overallScore,
    label,
    scoreBreakdown,
    matchedSignals: buildMatchedSignals(candidate, matchedSkills, scoreBreakdown),
    missingSignals: missingSkills.map((skill) => `Missing or unclear evidence for ${skill}`),
    evidence,
    explanation:
      enhancement?.explanation?.trim() ||
      `${candidate.name} is a ${label.toLowerCase()} because ${topReason}. This is a shortlist recommendation for recruiter review, not an automatic hiring decision.`,
    concerns,
    interviewQuestions,
    recommendedAction: enhancement?.recommendedAction?.trim() || recommendedAction(label, concerns),
    topReason
  };
}

export function fitLabel(score: number): FitLabel {
  if (score >= 85) return "Excellent Fit";
  if (score >= 70) return "Strong Fit";
  if (score >= 55) return "Moderate Fit";
  return "Weak Fit";
}

export function activityScore(signals?: ActivitySignals) {
  if (!signals) return 50;
  const numericSignals = [
    signals.profileCompleteness,
    signals.recentActivityScore,
    signals.assessmentScore,
    signals.responseSpeedScore,
    signals.applicationFreshness,
    signals.communicationScore
  ].filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const base = numericSignals.length ? average(numericSignals) : 50;
  const assetBoost = (signals.portfolioAvailable ? 4 : 0) + (signals.githubAvailable ? 4 : 0);
  return clampScore(base + assetBoost);
}

export function matchedMustHaveSkills(structured: StructuredRequirements, candidate: CandidateProfile) {
  const text = candidateText(candidate);
  return structured.mustHaveSkills.filter((skill) => textIncludesSkill(text, skill));
}

export function missingMustHaveSkills(structured: StructuredRequirements, candidate: CandidateProfile) {
  const matched = new Set(matchedMustHaveSkills(structured, candidate).map(normalizeSkill));
  return structured.mustHaveSkills.filter((skill) => !matched.has(normalizeSkill(skill)));
}

function semanticFitScore(job: RecruiterJobInput, structured: StructuredRequirements, candidate: CandidateProfile) {
  const jobTerms = uniqueStrings(
    [
      ...(structured.mustHaveSkills ?? []),
      ...(structured.niceToHaveSkills ?? []),
      ...(structured.domainKnowledge ?? []),
      ...(structured.toolsTechnologies ?? []),
      ...tokenize(job.title ?? ""),
      ...tokenize(job.description)
    ],
    80
  );
  const text = candidateText(candidate);
  const covered = jobTerms.filter((term) => textIncludesSkill(text, term));
  const skillCoverage = structured.mustHaveSkills.length
    ? matchedMustHaveSkills(structured, candidate).length / structured.mustHaveSkills.length
    : covered.length / Math.max(jobTerms.length, 1);
  const termOverlap = covered.length / Math.max(jobTerms.length, 1);
  const roleBoost = /full stack|ai|product|senior|lead/i.test(candidate.currentRole ?? "") ? 8 : 0;
  return clampScore(skillCoverage * 62 + termOverlap * 38 + roleBoost);
}

function mustHaveScore(structured: StructuredRequirements, candidate: CandidateProfile) {
  if (!structured.mustHaveSkills.length) return 75;
  const coverage = matchedMustHaveSkills(structured, candidate).length / structured.mustHaveSkills.length;
  return clampScore(coverage * 100);
}

function experienceScore(job: RecruiterJobInput, structured: StructuredRequirements, candidate: CandidateProfile) {
  const years = candidate.experienceYears ?? 0;
  const min = job.experienceMin ?? inferMinYears(structured) ?? 0;
  const max = job.experienceMax ?? inferMaxYears(structured);
  if (!min && !max) return clampScore(55 + Math.min(years, 10) * 4);
  if (min && years < min) return clampScore((years / min) * 72);
  if (max && years > max + 4) return 82;
  if (max && years > max) return 90;
  return 100;
}

function projectScore(structured: StructuredRequirements, candidate: CandidateProfile) {
  if (!candidate.projects.length) return 40;
  const projectText = candidate.projects.join(" ").toLowerCase();
  const importantTerms = uniqueStrings([
    ...structured.mustHaveSkills,
    ...structured.niceToHaveSkills,
    ...structured.domainKnowledge,
    "production",
    "dashboard",
    "ranking",
    "api",
    "database"
  ]);
  const matches = importantTerms.filter((term) => textIncludesSkill(projectText, term)).length;
  const volume = Math.min(candidate.projects.length * 12, 28);
  return clampScore(38 + matches * 8 + volume);
}

function careerMetadataScore(job: RecruiterJobInput, structured: StructuredRequirements, candidate: CandidateProfile) {
  const metadata = candidate.careerMetadata ?? {};
  const text = candidateText(candidate);
  const domainMatches = structured.domainKnowledge.filter((domain) => textIncludesSkill(text, domain)).length;
  const roleMatch = /senior|lead|staff|principal|full stack|ai|product/i.test(candidate.currentRole ?? "") ? 18 : 0;
  const locationMatch =
    !job.location ||
    !candidate.location ||
    /remote/i.test(String(job.workMode)) ||
    job.location.toLowerCase().includes(candidate.location.toLowerCase())
      ? 12
      : 4;
  const education = candidate.education ? 8 : 0;
  const certifications = metadata.certifications?.length ? 8 : 0;
  const portfolio = metadata.portfolioUrl || candidate.activitySignals?.portfolioAvailable ? 5 : 0;
  return clampScore(45 + domainMatches * 8 + roleMatch + locationMatch + education + certifications + portfolio);
}

function riskPenaltyScore(
  job: RecruiterJobInput,
  structured: StructuredRequirements,
  candidate: CandidateProfile,
  missingSkills: string[]
) {
  const missingPenalty = Math.min(24, missingSkills.length * 4);
  const min = job.experienceMin ?? inferMinYears(structured) ?? 0;
  const experiencePenalty = min && (candidate.experienceYears ?? 0) < min ? Math.min(16, (min - (candidate.experienceYears ?? 0)) * 4) : 0;
  const evidencePenalty = candidate.resumeText || candidate.projects.length ? 0 : 8;
  const activityPenalty = activityScore(candidate.activitySignals) < 55 ? 5 : 0;
  return clampScore(missingPenalty + experiencePenalty + evidencePenalty + activityPenalty);
}

function buildMatchedSignals(candidate: CandidateProfile, matchedSkills: string[], breakdown: ScoreBreakdown) {
  const signals = [
    ...matchedSkills.map((skill) => `Evidence for ${skill}`),
    breakdown.experience >= 80 && candidate.experienceYears ? `${candidate.experienceYears} years aligns with seniority` : null,
    breakdown.projects >= 70 ? "Relevant project evidence found" : null,
    breakdown.activitySignals >= 75 ? "Healthy activity and engagement signals" : null
  ];
  return signals.filter((item): item is string => Boolean(item)).slice(0, 10);
}

function evidenceFromCandidate(candidate: CandidateProfile, matchedSkills: string[]) {
  const snippets = [
    candidate.currentRole ? `Current role: ${candidate.currentRole}` : null,
    candidate.experienceYears ? `${candidate.experienceYears} years of experience` : null,
    matchedSkills.length ? `Matched skills: ${matchedSkills.slice(0, 8).join(", ")}` : null,
    candidate.projects[0] ? `Project evidence: ${candidate.projects[0]}` : null,
    candidate.careerMetadata?.domains?.length ? `Domain evidence: ${candidate.careerMetadata.domains.join(", ")}` : null
  ];
  return snippets.filter((item): item is string => Boolean(item)).slice(0, 6);
}

function buildConcerns(
  job: RecruiterJobInput,
  candidate: CandidateProfile,
  missingSkills: string[],
  riskPenalty: number
) {
  const concerns = [];
  if (missingSkills.length) concerns.push(`Verify missing or unclear must-have skills: ${missingSkills.slice(0, 5).join(", ")}.`);
  if (job.experienceMin && (candidate.experienceYears ?? 0) < job.experienceMin) {
    concerns.push(`Experience is below the requested ${job.experienceMin}+ years.`);
  }
  if (activityScore(candidate.activitySignals) < 55) concerns.push("Activity signals are weak; confirm responsiveness and current interest.");
  if (riskPenalty >= 18) concerns.push("Risk penalty is elevated, so evidence should be reviewed carefully.");
  return concerns.length ? concerns : ["No major concerns detected from provided candidate data; still verify evidence in interview."];
}

function buildInterviewQuestions(
  structured: StructuredRequirements,
  candidate: CandidateProfile,
  missingSkills: string[]
) {
  const primarySkill = structured.mustHaveSkills[0] ?? "the core stack";
  const project = candidate.projects[0] ? "the most relevant project on your profile" : "a recent production project";
  return [
    `Walk us through ${project} and the exact role you played.`,
    `How have you used ${primarySkill} in a production system?`,
    missingSkills[0]
      ? `Your profile has limited evidence for ${missingSkills[0]}. What hands-on experience do you have there?`
      : "Which technical tradeoff in this role would you want to validate first?",
    "Describe a time you balanced AI output quality, user experience, and product constraints.",
    "What evidence should we review to confirm your strongest claimed skills?"
  ];
}

function recommendedAction(label: FitLabel, concerns: string[]) {
  if (label === "Excellent Fit") return "Prioritize for recruiter screen and validate the strongest evidence areas.";
  if (label === "Strong Fit") return "Shortlist for human review and probe the listed gaps in a first-round conversation.";
  if (label === "Moderate Fit") return "Keep as backup or route to a targeted technical screen if the candidate pool is shallow.";
  return concerns.length
    ? "Do not auto-reject; review only if the role requirements can flex or new evidence is provided."
    : "Review manually before deciding next steps.";
}

function buildTopReason(candidate: CandidateProfile, matchedSkills: string[], breakdown: ScoreBreakdown) {
  if (matchedSkills.length >= 4) return `strong must-have coverage across ${matchedSkills.slice(0, 4).join(", ")}`;
  if (breakdown.projects >= 75) return "relevant project evidence supports the role requirements";
  if (breakdown.activitySignals >= 80) return "activity and engagement signals are strong";
  if (candidate.experienceYears) return `${candidate.experienceYears} years of experience gives partial relevance`;
  return "the available evidence is limited and needs recruiter validation";
}

function inferMinYears(structured: StructuredRequirements) {
  const text = structured.experienceRequirements.join(" ");
  return Number(text.match(/(\d+)\s*(?:-|to|\+)?\s*(?:years?)/i)?.[1] ?? "") || null;
}

function inferMaxYears(structured: StructuredRequirements) {
  const text = structured.experienceRequirements.join(" ");
  return Number(text.match(/\d+\s*(?:-|to)\s*(\d+)\s*(?:years?)/i)?.[1] ?? "") || null;
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map(normalizeSkill)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function textIncludesSkill(text: string, skill: string) {
  const normalized = normalizeSkill(skill);
  if (!normalized) return false;
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(text);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

const STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "have",
  "into",
  "the",
  "this",
  "that",
  "with",
  "will",
  "you",
  "your",
  "role",
  "team",
  "work",
  "build",
  "using"
]);
