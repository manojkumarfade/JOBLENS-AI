import { z } from "zod";

export const activitySignalsSchema = z.object({
  profileCompleteness: z.number().min(0).max(100).optional(),
  recentActivityScore: z.number().min(0).max(100).optional(),
  assessmentScore: z.number().min(0).max(100).optional(),
  responseSpeedScore: z.number().min(0).max(100).optional(),
  portfolioAvailable: z.boolean().optional(),
  githubAvailable: z.boolean().optional(),
  applicationFreshness: z.number().min(0).max(100).optional(),
  communicationScore: z.number().min(0).max(100).optional()
});

export const careerMetadataSchema = z.record(z.unknown()).optional();

export const recruiterJobInputSchema = z.object({
  id: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  experienceMin: z.coerce.number().int().min(0).max(60).optional(),
  experienceMax: z.coerce.number().int().min(0).max(60).optional(),
  description: z.string().min(20).max(30000),
  mustHaveSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  salaryRange: z.string().optional(),
  workMode: z.string().optional()
});

export const structuredRequirementsSchema = z.object({
  roleSummary: z.string(),
  seniorityLevel: z.string(),
  coreResponsibilities: z.array(z.string()).default([]),
  mustHaveSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  domainKnowledge: z.array(z.string()).default([]),
  toolsTechnologies: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  experienceRequirements: z.array(z.string()).default([]),
  disqualifiers: z.array(z.string()).default([]),
  scoringWeights: z.object({
    semanticFit: z.number(),
    mustHaveSkills: z.number(),
    experience: z.number(),
    projects: z.number(),
    careerMetadata: z.number(),
    activitySignals: z.number()
  })
});

export const candidateSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  resumeText: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  experienceYears: z.number().nullable().optional(),
  currentRole: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  projects: z.array(z.string()).default([]),
  careerMetadata: careerMetadataSchema,
  activitySignals: activitySignalsSchema.optional(),
  isDemo: z.boolean().optional()
});

export const rankRequestSchema = z.object({
  jobId: z.string().uuid().optional(),
  jobDescription: z.string().min(20).max(30000),
  job: recruiterJobInputSchema.partial().optional(),
  structuredRequirements: structuredRequirementsSchema.optional(),
  candidates: z.array(candidateSchema).min(1).max(50)
});

export const aiRankingEnhancementSchema = z.object({
  rankedCandidates: z.array(
    z.object({
      candidateId: z.string(),
      semanticScore: z.number().min(0).max(100).optional(),
      explanation: z.string().optional(),
      concerns: z.array(z.string()).optional(),
      interviewQuestions: z.array(z.string()).optional(),
      recommendedAction: z.string().optional()
    })
  )
});
