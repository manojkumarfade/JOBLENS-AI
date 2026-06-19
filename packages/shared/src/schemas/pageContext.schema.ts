import { z } from "zod";

export const pageContextSchema = z.object({
  url: z.string().url().or(z.string().min(1)),
  title: z.string().min(0).max(500),
  sourceType: z.enum(["general_page", "job_page", "recruiter_page", "unknown"]).default("general_page"),
  extractedAt: z.string().optional(),
  text: z.string().min(1).max(12000),
  headings: z.array(z.string().max(300)).max(40).default([]),
  likelyJobTitle: z.string().max(300).optional(),
  likelyCompany: z.string().max(300).optional(),
  confidence: z.number().min(0).max(1).optional()
});

export type PageContextInput = z.infer<typeof pageContextSchema>;
