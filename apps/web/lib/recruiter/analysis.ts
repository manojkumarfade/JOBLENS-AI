import type { RecruiterJobInput, StructuredRequirements } from "./types";

export const RECRUITER_FAIRNESS_NOTE =
  "This ranking is decision support for human recruiters. It does not use protected attributes, does not infer sensitive traits, and should not be the sole basis for hiring decisions.";

export const recruiterScoringWeights = {
  semanticFit: 30,
  mustHaveSkills: 25,
  experience: 15,
  projects: 10,
  careerMetadata: 10,
  activitySignals: 10
};

export const knownTechnicalSkills = [
  "ai",
  "aws",
  "azure",
  "ci/cd",
  "css",
  "docker",
  "express",
  "fastapi",
  "figma",
  "firebase",
  "gcp",
  "generative ai",
  "github actions",
  "graphql",
  "html",
  "java",
  "javascript",
  "kubernetes",
  "langchain",
  "llm",
  "machine learning",
  "mongodb",
  "next.js",
  "node.js",
  "postgres",
  "prisma",
  "python",
  "rag",
  "react",
  "redis",
  "redux",
  "rest api",
  "sql",
  "supabase",
  "tailwind",
  "typescript",
  "vercel",
  "vite"
];

const softSkillTerms = [
  "communication",
  "collaboration",
  "leadership",
  "ownership",
  "stakeholder",
  "mentoring",
  "problem solving",
  "product thinking"
];

const domainTerms = [
  "recruiting",
  "hr",
  "ats",
  "marketplace",
  "fintech",
  "healthcare",
  "saas",
  "ecommerce",
  "developer tools",
  "enterprise",
  "analytics",
  "automation"
];

export function normalizeSkill(value: string) {
  return value
    .toLowerCase()
    .replace(/\breactjs\b/g, "react")
    .replace(/\bnodejs\b/g, "node.js")
    .replace(/\bnextjs\b/g, "next.js")
    .replace(/\bpostgresql\b/g, "postgres")
    .replace(/\bgenerative artificial intelligence\b/g, "generative ai")
    .replace(/\bartificial intelligence\b/g, "ai")
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function uniqueStrings(values: Array<string | null | undefined>, limit = 40) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const normalized = normalizeSkill(String(value ?? ""));
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
    if (output.length >= limit) break;
  }
  return output;
}

export function splitSkills(value: string | string[] | undefined) {
  if (Array.isArray(value)) return uniqueStrings(value);
  if (!value) return [];
  return uniqueStrings(value.split(/[,;\n]/));
}

export function analyzeJobDeterministic(input: RecruiterJobInput): StructuredRequirements {
  const description = sanitizePlainText(input.description, 16000);
  const searchable = `${input.title ?? ""} ${description}`.toLowerCase();
  const explicitMust = splitSkills(input.mustHaveSkills);
  const explicitNice = splitSkills(input.niceToHaveSkills);
  const detectedSkills = knownTechnicalSkills.filter((skill) => hasTerm(searchable, skill));
  const mustHaveSkills = uniqueStrings([...explicitMust, ...skillsNearRequirementLanguage(description), ...detectedSkills.slice(0, 8)], 14);
  const niceToHaveSkills = uniqueStrings(
    [...explicitNice, ...detectedSkills.filter((skill) => !mustHaveSkills.includes(skill)).slice(0, 10)],
    14
  );
  const domainKnowledge = domainTerms.filter((term) => hasTerm(searchable, term));
  const softSkills = softSkillTerms.filter((term) => hasTerm(searchable, term));
  const seniorityLevel = inferSeniority(input, description);
  const responsibilities = extractResponsibilities(description);
  const experienceRequirements = extractExperienceRequirements(input, description);

  return {
    roleSummary: buildRoleSummary(input, seniorityLevel, mustHaveSkills, domainKnowledge),
    seniorityLevel,
    coreResponsibilities: responsibilities,
    mustHaveSkills,
    niceToHaveSkills,
    domainKnowledge,
    toolsTechnologies: uniqueStrings([...mustHaveSkills, ...niceToHaveSkills], 16),
    softSkills,
    experienceRequirements,
    disqualifiers: buildDisqualifiers(input, mustHaveSkills),
    scoringWeights: recruiterScoringWeights
  };
}

export function sanitizePlainText(text: string, maxLength = 12000) {
  return text
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function hasTerm(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(text);
}

function skillsNearRequirementLanguage(description: string) {
  const matches = description.match(
    /(?:must have|required|requirements?|need(?:ed)?|expertise in|proficiency in|strong with)([^.]{0,180})/gi
  );
  if (!matches) return [];
  return knownTechnicalSkills.filter((skill) => matches.some((match) => hasTerm(match.toLowerCase(), skill)));
}

function inferSeniority(input: RecruiterJobInput, description: string) {
  const text = `${input.title ?? ""} ${description}`.toLowerCase();
  const min = input.experienceMin;
  if (/principal|staff|architect|10\+?\s*years/.test(text) || (min ?? 0) >= 9) return "staff/principal";
  if (/senior|lead|sr\.?|7\+?\s*years|8\+?\s*years/.test(text) || (min ?? 0) >= 5) return "senior";
  if (/mid|3\+?\s*years|4\+?\s*years/.test(text) || (min ?? 0) >= 3) return "mid-level";
  if (/junior|entry|fresher|graduate|intern/.test(text)) return "entry-level";
  return "mid-to-senior";
}

function extractResponsibilities(description: string) {
  const sentences = description
    .split(/(?<=[.!?])\s+|\n/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const selected = sentences.filter((sentence) =>
    /build|develop|design|own|lead|ship|collaborate|integrate|rank|analy[sz]e|optimi[sz]e|maintain/i.test(sentence)
  );
  const fallback = sentences.slice(0, 4);
  return (selected.length ? selected : fallback).map((item) => item.replace(/^[-*]\s*/, "")).slice(0, 6);
}

function extractExperienceRequirements(input: RecruiterJobInput, description: string) {
  const found = description.match(/\b\d+\+?\s*(?:to\s*\d+\s*)?years?[^.]{0,90}/gi) ?? [];
  const explicit =
    input.experienceMin || input.experienceMax
      ? [`${input.experienceMin ?? 0}-${input.experienceMax ?? input.experienceMin ?? "?"} years preferred`]
      : [];
  return uniqueStrings([...explicit, ...found], 6);
}

function buildRoleSummary(
  input: RecruiterJobInput,
  seniorityLevel: string,
  mustHaveSkills: string[],
  domainKnowledge: string[]
) {
  const title = input.title?.trim() || "this role";
  const skills = mustHaveSkills.slice(0, 5).join(", ") || "the required stack";
  const domain = domainKnowledge.length ? ` in ${domainKnowledge.slice(0, 2).join(" and ")}` : "";
  return `${title} is a ${seniorityLevel} role focused on ${skills}${domain}.`;
}

function buildDisqualifiers(input: RecruiterJobInput, mustHaveSkills: string[]) {
  const items = [];
  if (input.experienceMin) items.push(`Less than ${input.experienceMin} years of relevant experience requires close review.`);
  if (mustHaveSkills.length) items.push(`No clear evidence for critical skills: ${mustHaveSkills.slice(0, 4).join(", ")}.`);
  items.push("Unsupported claims or unclear resume evidence should be verified by a human recruiter.");
  return items;
}
