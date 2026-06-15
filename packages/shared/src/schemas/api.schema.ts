import { z } from "zod";
import { pageContextSchema } from "./pageContext.schema";

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fallbackMode: z.string().optional()
  })
});

export const voicePreferencesPatchSchema = z.object({
  defaultVoiceMode: z.literal("web_speech").optional(),
  languageCode: z.string().min(2).max(20).optional(),
  autoFallbackEnabled: z.boolean().optional(),
  speechRate: z.number().min(0.5).max(2).optional(),
  speechPitch: z.number().min(0).max(2).optional(),
  preferredBrowserVoice: z.string().nullable().optional()
});

export const modelCredentialsPatchSchema = z.object({
  brainProvider: z.enum(["platform", "typegpt"]).optional(),
  brainModel: z.string().optional(),
  typegptApiKey: z.string().nullable().optional()
});

export const webSpeechAskSchema = z.object({
  page: pageContextSchema.pick({ url: true, title: true, sourceType: true, text: true, likelyJobTitle: true, likelyCompany: true, confidence: true }).extend({
    headings: z.array(z.string()).optional()
  }),
  question: z.string().min(1).max(1000),
  resumeId: z.string().uuid().optional(),
  voiceSessionId: z.string().uuid().optional()
});
