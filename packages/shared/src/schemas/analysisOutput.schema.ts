import { z } from "zod";

export const jobSummarySchema = z.object({
  roleTitle: z.string().min(1),
  companyName: z.string().min(1),
  summary: z.string().min(1),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  salaryOrLocation: z.string().default("unknown")
});

export const resumeComparisonSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  strongMatches: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  recommendedActions: z.array(z.string()).default([]),
  applyRecommendation: z.enum(["apply", "maybe", "skip"])
});

export const resumeTailoringSchema = z.object({
  tailoredBullets: z.array(z.string()).default([]),
  keywordsToAddIfTrue: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([])
});

export type JobSummaryOutput = z.infer<typeof jobSummarySchema>;
export type ResumeComparisonOutput = z.infer<typeof resumeComparisonSchema>;
export type ResumeTailoringOutput = z.infer<typeof resumeTailoringSchema>;
