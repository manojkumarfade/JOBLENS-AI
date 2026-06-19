export type FitLabel = "Excellent Fit" | "Strong Fit" | "Moderate Fit" | "Weak Fit";

export type WorkMode = "remote" | "hybrid" | "onsite" | "";

export interface RecruiterJobInput {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  experienceMin?: number;
  experienceMax?: number;
  description: string;
  mustHaveSkills?: string[];
  niceToHaveSkills?: string[];
  salaryRange?: string;
  workMode?: WorkMode | string;
}

export interface StructuredRequirements {
  roleSummary: string;
  seniorityLevel: string;
  coreResponsibilities: string[];
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  domainKnowledge: string[];
  toolsTechnologies: string[];
  softSkills: string[];
  experienceRequirements: string[];
  disqualifiers: string[];
  scoringWeights: {
    semanticFit: number;
    mustHaveSkills: number;
    experience: number;
    projects: number;
    careerMetadata: number;
    activitySignals: number;
  };
}

export interface ActivitySignals {
  profileCompleteness?: number;
  recentActivityScore?: number;
  assessmentScore?: number;
  responseSpeedScore?: number;
  portfolioAvailable?: boolean;
  githubAvailable?: boolean;
  applicationFreshness?: number;
  communicationScore?: number;
}

export interface CareerMetadata {
  companies?: string[];
  domains?: string[];
  certifications?: string[];
  noticePeriod?: string;
  salaryExpectation?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  source?: "demo" | "manual" | "upload" | "database" | string;
  [key: string]: unknown;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  resumeText?: string | null;
  skills: string[];
  experienceYears?: number | null;
  currentRole?: string | null;
  location?: string | null;
  education?: string | null;
  projects: string[];
  careerMetadata?: CareerMetadata;
  activitySignals?: ActivitySignals;
  isDemo?: boolean;
}

export interface ScoreBreakdown {
  semanticFit: number;
  mustHaveSkills: number;
  experience: number;
  projects: number;
  careerMetadata: number;
  activitySignals: number;
  riskPenalty: number;
}

export interface RankedCandidate {
  candidateId: string;
  candidate: CandidateProfile;
  rank: number;
  overallScore: number;
  label: FitLabel;
  scoreBreakdown: ScoreBreakdown;
  matchedSignals: string[];
  missingSignals: string[];
  evidence: string[];
  explanation: string;
  concerns: string[];
  interviewQuestions: string[];
  recommendedAction: string;
  topReason: string;
}

export interface RankingResponse {
  jobUnderstanding: StructuredRequirements;
  rankedCandidates: RankedCandidate[];
  fairnessNote: string;
  warning?: string;
}
