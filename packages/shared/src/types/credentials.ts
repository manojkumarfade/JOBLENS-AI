import type { ModelProvider } from "../modelCatalog";

export interface CredentialStatus {
  brainProvider: ModelProvider;
  brainModel: string;
  typegptKeyConfigured: boolean;
}

export interface ModelMeta {
  provider: "typegpt";
  model: string;
  viaByok: boolean;
  latencyMs?: number;
}
