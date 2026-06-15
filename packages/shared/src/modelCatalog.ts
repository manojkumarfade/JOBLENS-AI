export type ModelProvider = "platform" | "typegpt";
export type ModelSpeedTier = "fast" | "balanced" | "quality";
export type RequiredApiKey = "typegpt" | null;

export interface BrainModelCatalogItem {
  id: string;
  label: string;
  provider: "typegpt";
  speedTier: ModelSpeedTier;
  requiresApiKey: "typegpt";
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
  }
];

export const modelCatalog = { brainModels };

export function getBrainModel(id: string) {
  return brainModels.find((model) => model.id === id);
}

export function getModelLabel(id: string) {
  return getBrainModel(id)?.label ?? id;
}
