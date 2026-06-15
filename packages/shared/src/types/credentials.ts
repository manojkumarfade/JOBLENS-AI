import type { ModelProvider } from "../modelCatalog";

export interface CredentialStatus {
  brainProvider: ModelProvider;
  brainModel: string;
  voiceModel: string;
  typegptKeyConfigured: boolean;
  googleKeyConfigured: boolean;
  useOwnLiveKit: boolean;
  liveKitKeyConfigured: boolean;
  liveKitUrl: string | null;
}

export interface ModelMeta {
  provider: "typegpt" | "gemini";
  model: string;
  viaByok: boolean;
  latencyMs?: number;
}
