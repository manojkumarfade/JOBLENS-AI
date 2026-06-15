export type ModelProvider = "platform" | "typegpt" | "gemini";
export type ModelSpeedTier = "fast" | "balanced" | "quality";
export type RequiredApiKey = "typegpt" | "google" | null;

export interface BrainModelCatalogItem {
  id: string;
  label: string;
  provider: Exclude<ModelProvider, "platform">;
  speedTier: ModelSpeedTier;
  requiresApiKey: Exclude<RequiredApiKey, null>;
  description: string;
}

export interface VoiceModelCatalogItem {
  id: string;
  label: string;
  provider: "gemini";
  speedTier: ModelSpeedTier;
  requiresApiKey: "google";
  description: string;
}

export const TYPEGPT_BASE_URL = "https://api.typegpt.net/v1";

export const brainModels: BrainModelCatalogItem[] = [
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    provider: "typegpt",
    speedTier: "fast",
    requiresApiKey: "typegpt",
    description: "High-capacity open model. Best default for job analysis and resume comparison."
  },
  {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    provider: "typegpt",
    speedTier: "fast",
    requiresApiKey: "typegpt",
    description: "Lightweight, low-latency model for quick Q&A and summaries."
  },
  {
    id: "mistralai/ministral-14b-instruct-2512",
    label: "Ministral 14B Instruct",
    provider: "typegpt",
    speedTier: "fast",
    requiresApiKey: "typegpt",
    description: "Compact instruct model for short, direct answers."
  },
  {
    id: "qwen/qwen3-next-80b-a3b-instruct",
    label: "Qwen3 Next 80B A3B Instruct",
    provider: "typegpt",
    speedTier: "balanced",
    requiresApiKey: "typegpt",
    description: "Strong reasoning model. Recommended for resume tailoring and eligibility analysis."
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "gemini",
    speedTier: "fast",
    requiresApiKey: "google",
    description: "Default brain model for Web Speech answers and job summaries."
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "gemini",
    speedTier: "quality",
    requiresApiKey: "google",
    description: "Higher-accuracy reasoning for resume tailoring and deep comparisons."
  }
];

export const voiceModels: VoiceModelCatalogItem[] = [
  {
    id: "gemini-2.0-flash-live",
    label: "Gemini 2.0 Flash Live",
    provider: "gemini",
    speedTier: "fast",
    requiresApiKey: "google",
    description: "Realtime audio model for Natural Call Voice. Used only via LiveKit agent."
  }
];

export const modelCatalog = { brainModels, voiceModels };

export function getBrainModel(id: string) {
  return brainModels.find((model) => model.id === id);
}

export function getVoiceModel(id: string) {
  return voiceModels.find((model) => model.id === id);
}

export function getModelLabel(id: string) {
  return getBrainModel(id)?.label ?? getVoiceModel(id)?.label ?? id;
}
