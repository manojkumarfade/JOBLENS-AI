import { knownTechnicalSkills, sanitizePlainText, splitSkills, uniqueStrings } from "./analysis";
import type { ActivitySignals, CandidateProfile, CareerMetadata } from "./types";

export interface CandidateParseInput {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  resumeText?: string | null;
  skills?: string[] | string;
  experienceYears?: number | null;
  currentRole?: string | null;
  location?: string | null;
  education?: string | null;
  projects?: string[] | string;
  careerMetadata?: CareerMetadata;
  activitySignals?: ActivitySignals;
  isDemo?: boolean;
}

export function parseCandidate(input: CandidateParseInput): CandidateProfile {
  const resumeText = sanitizePlainText(input.resumeText ?? "", 20000);
  const email = input.email?.trim() || resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
  const phone =
    input.phone?.trim() ||
    resumeText.match(/(?:\+?\d[\d ()-]{7,}\d)/)?.[0]?.replace(/\s+/g, " ").trim() ||
    null;
  const skills = uniqueStrings([...splitSkills(input.skills), ...extractSkillsFromText(resumeText)], 40);
  const projects = uniqueStrings([...splitList(input.projects), ...extractProjects(resumeText)], 10);
  const careerMetadata: CareerMetadata = {
    ...extractCareerMetadata(resumeText),
    ...(input.careerMetadata ?? {})
  };

  return {
    id: input.id || makeId(),
    name: input.name?.trim() || inferName(resumeText, email),
    email,
    phone,
    resumeText,
    skills,
    experienceYears: normalizeYears(input.experienceYears) ?? inferExperienceYears(resumeText),
    currentRole: input.currentRole?.trim() || inferCurrentRole(resumeText),
    location: input.location?.trim() || inferLocation(resumeText),
    education: input.education?.trim() || inferEducation(resumeText),
    projects,
    careerMetadata,
    activitySignals: normalizeActivitySignals(input.activitySignals),
    isDemo: Boolean(input.isDemo)
  };
}

export function candidateText(candidate: CandidateProfile) {
  return [
    candidate.name,
    candidate.currentRole,
    candidate.location,
    candidate.education,
    candidate.skills.join(" "),
    candidate.projects.join(" "),
    candidate.resumeText,
    candidate.careerMetadata?.domains?.join(" "),
    candidate.careerMetadata?.companies?.join(" "),
    candidate.careerMetadata?.certifications?.join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function extractSkillsFromText(text: string) {
  const lower = text.toLowerCase();
  return knownTechnicalSkills.filter((skill) => lower.includes(skill));
}

function splitList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return value.split(/[\n;]+/).map((item) => item.trim());
}

function inferName(text: string, email?: string | null) {
  const firstLine = text
    .split(/[.\n\r]/)
    .map((line) => line.trim())
    .find((line) => /^[A-Za-z][A-Za-z .'-]{2,60}$/.test(line) && !/@/.test(line));
  if (firstLine) return firstLine;
  if (email) {
    return email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return "Unnamed Candidate";
}

function inferCurrentRole(text: string) {
  const roleLine = text.match(
    /\b(senior|lead|staff|principal|full stack|frontend|backend|ai|machine learning|software|product)\b[^.\n]{0,70}\b(engineer|developer|architect|manager|scientist)\b/i
  )?.[0];
  return roleLine?.replace(/\s+/g, " ").trim() || null;
}

function inferExperienceYears(text: string) {
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/gi)]
    .map((match) => Number(match[1]))
    .filter(Number.isFinite);
  if (!matches.length) return null;
  return Math.max(...matches);
}

function normalizeYears(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(50, value));
}

function inferEducation(text: string) {
  const match = text.match(/\b(B\.?Tech|M\.?Tech|B\.?E\.?|M\.?S\.?|B\.?S\.?|MBA|Bachelor|Master|PhD)[^.\n]{0,90}/i);
  return match?.[0]?.replace(/\s+/g, " ").trim() || null;
}

function inferLocation(text: string) {
  const match = text.match(/\b(?:Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Delhi|Gurugram|Noida|Chennai|Kolkata|Remote|San Francisco|New York|Austin|Seattle)\b/i);
  return match?.[0] ?? null;
}

function extractProjects(text: string) {
  const projectSection = text.match(/projects?\s*[:\n-]\s*([\s\S]{0,1200})/i)?.[1] ?? "";
  return projectSection
    .split(/[.;\n]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 24)
    .slice(0, 8);
}

function extractCareerMetadata(text: string): CareerMetadata {
  const companies = [...text.matchAll(/\b(?:at|for|with)\s+([A-Z][A-Za-z0-9&. -]{2,40})/g)]
    .map((match) => match[1].trim())
    .filter((value) => !/react|node|python|typescript/i.test(value))
    .slice(0, 6);
  const certifications = [...text.matchAll(/\b(certified|certification|aws certified|azure certified|scrum)[^.\n]{0,80}/gi)]
    .map((match) => match[0].trim())
    .slice(0, 6);
  return {
    companies: uniqueStrings(companies, 6),
    domains: uniqueStrings(extractDomains(text), 6),
    certifications: uniqueStrings(certifications, 6)
  };
}

function extractDomains(text: string) {
  const domains = ["saas", "recruiting", "hr", "fintech", "healthcare", "ecommerce", "marketplace", "analytics", "automation"];
  const lower = text.toLowerCase();
  return domains.filter((domain) => lower.includes(domain));
}

function normalizeActivitySignals(signals?: ActivitySignals): ActivitySignals {
  return {
    profileCompleteness: clampSignal(signals?.profileCompleteness ?? 70),
    recentActivityScore: clampSignal(signals?.recentActivityScore ?? 65),
    assessmentScore: clampSignal(signals?.assessmentScore ?? 70),
    responseSpeedScore: clampSignal(signals?.responseSpeedScore ?? 65),
    portfolioAvailable: Boolean(signals?.portfolioAvailable),
    githubAvailable: Boolean(signals?.githubAvailable),
    applicationFreshness: clampSignal(signals?.applicationFreshness ?? 70),
    communicationScore: clampSignal(signals?.communicationScore ?? 70)
  };
}

function clampSignal(value: unknown) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `candidate-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
