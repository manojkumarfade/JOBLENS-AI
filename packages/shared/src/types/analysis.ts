export interface JobSummary {
  roleTitle: string;
  companyName: string | "unknown";
  summary: string;
  responsibilities: string[];
  requirements: string[];
  salaryOrLocation: string | "unknown";
}

export interface ResumeComparison {
  matchScore: number;
  strongMatches: string[];
  missingSkills: string[];
  recommendedActions: string[];
  applyRecommendation: "apply" | "maybe" | "skip";
}

export interface ResumeTailoring {
  tailoredBullets: string[];
  keywordsToAddIfTrue: string[];
  warnings: string[];
}

export interface JobAnalysisRecord {
  id?: string;
  roleTitle?: string | null;
  companyName?: string | null;
  summary?: string | null;
  matchScore?: number | null;
  strongMatches?: string[];
  missingSkills?: string[];
  recommendedActions?: string[];
  applyRecommendation?: "apply" | "maybe" | "skip" | null;
  tailoredBullets?: string[];
  source?: "web_speech" | "manual";
  createdAt?: string;
}
