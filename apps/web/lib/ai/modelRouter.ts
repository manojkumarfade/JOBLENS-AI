import { brainModels, getBrainModel, type ModelProvider } from "@joblens/shared";
import { createSupabaseServiceClient } from "../supabase/server";
import { env } from "../env";
import { decryptSecret, encryptSecret } from "./encryption";
import { callTypeGpt, validateTypeGptKey, type ChatMessage } from "./providers/typegpt";

type CredentialRow = {
  user_id: string;
  brain_provider: ModelProvider;
  brain_model: string;
  typegpt_api_key_ciphertext: string | null;
  typegpt_key_configured: boolean;
};

const DEFAULT_TYPEGPT_MODEL = "openai/gpt-oss-20b";

export class ModelCredentialsError extends Error {
  code = "MODEL_CREDENTIALS_MISSING" as const;
}

export async function ensureCredentialRow(userId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_model_credentials")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as CredentialRow;

  const { data: inserted, error: insertError } = await supabase
    .from("user_model_credentials")
    .insert({ user_id: userId })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return inserted as CredentialRow;
}

export function credentialStatus(row: CredentialRow) {
  const normalized = normalizeCredentialSelection(row);
  return {
    brainProvider: normalized.provider,
    brainModel: normalized.model,
    typegptKeyConfigured: row.typegpt_key_configured
  };
}

export async function updateCredentialRow(
  userId: string,
  payload: {
    brainProvider?: ModelProvider;
    brainModel?: string;
    typegptApiKey?: string | null;
  }
) {
  const current = await ensureCredentialRow(userId);
  const patch: Record<string, unknown> = {};

  if (payload.brainProvider) patch.brain_provider = payload.brainProvider;
  if (payload.brainModel) patch.brain_model = payload.brainModel;

  if (payload.typegptApiKey !== undefined && payload.typegptApiKey !== null) {
    if (payload.typegptApiKey.trim() === "") {
      patch.typegpt_api_key_ciphertext = null;
      patch.typegpt_key_configured = false;
      if ((payload.brainProvider ?? current.brain_provider) === "typegpt") patch.brain_provider = "platform";
    } else {
      await validateTypeGptKey(payload.typegptApiKey);
      patch.typegpt_api_key_ciphertext = encryptSecret(payload.typegptApiKey);
      patch.typegpt_key_configured = true;
    }
  }

  const nextProvider = (patch.brain_provider as ModelProvider | undefined) ?? current.brain_provider;
  if (nextProvider === "typegpt" && !hasTypeGptCredential(current, patch)) {
    throw new ModelCredentialsError("No TypeGPT key is configured for the selected brain provider.");
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_model_credentials")
    .update(patch)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as CredentialRow;
}

function hasTypeGptCredential(row: CredentialRow, patch: Record<string, unknown>) {
  if (typeof patch.typegpt_key_configured === "boolean") {
    return patch.typegpt_key_configured || Boolean(env("PLATFORM_TYPEGPT_API_KEY"));
  }
  return row.typegpt_key_configured || Boolean(env("PLATFORM_TYPEGPT_API_KEY"));
}

export async function resolveBrainModel(userId: string) {
  const row = await ensureCredentialRow(userId);
  const normalized = normalizeCredentialSelection(row);
  let provider = normalized.provider;
  let model = normalized.model;
  let apiKey: string | null = null;
  let viaByok = false;

  if (provider === "platform") {
    model = normalizeBrainModel(env("PLATFORM_TYPEGPT_DEFAULT_MODEL", DEFAULT_TYPEGPT_MODEL));
    const catalogModel = getBrainModel(model) ?? brainModels.find((item) => item.id === model);
    provider = catalogModel?.provider ?? "typegpt";
  }

  if (provider === "typegpt") {
    apiKey = decryptSecret(row.typegpt_api_key_ciphertext) ?? env("PLATFORM_TYPEGPT_API_KEY");
    viaByok = Boolean(row.typegpt_api_key_ciphertext);
  }

  if (!apiKey) throw new ModelCredentialsError(`No API key is configured for ${provider}.`);

  return { provider: provider as "typegpt", model, apiKey, viaByok };
}

function normalizeCredentialSelection(row: CredentialRow) {
  const provider = row.brain_provider === "typegpt" || row.brain_provider === "platform" ? row.brain_provider : "platform";
  return {
    provider,
    model: normalizeBrainModel(row.brain_model)
  };
}

function normalizeBrainModel(model: string | null | undefined) {
  return getBrainModel(model ?? "")?.id ?? DEFAULT_TYPEGPT_MODEL;
}

export async function callBrainModel(userId: string, messages: ChatMessage[], temperature = 0.3) {
  const started = Date.now();
  const resolved = await resolveBrainModel(userId);
  const answer = await callTypeGpt({ apiKey: resolved.apiKey, model: resolved.model, messages, temperature });

  return {
    answer,
    modelMeta: {
      provider: resolved.provider,
      model: resolved.model,
      viaByok: resolved.viaByok,
      latencyMs: Date.now() - started
    }
  };
}
