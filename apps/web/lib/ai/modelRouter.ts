import { brainModels, getBrainModel, getVoiceModel, type ModelProvider } from "@joblens/shared";
import { createSupabaseServiceClient } from "../supabase/server";
import { boolEnv, env } from "../env";
import { decryptSecret, encryptSecret } from "./encryption";
import { callGeminiText, validateGeminiKey } from "./providers/gemini";
import { callTypeGpt, validateTypeGptKey, type ChatMessage } from "./providers/typegpt";

type CredentialRow = {
  user_id: string;
  brain_provider: ModelProvider;
  brain_model: string;
  voice_model: string;
  typegpt_api_key_ciphertext: string | null;
  google_api_key_ciphertext: string | null;
  use_own_livekit: boolean;
  livekit_url: string | null;
  livekit_api_key_ciphertext: string | null;
  livekit_api_secret_ciphertext: string | null;
  typegpt_key_configured: boolean;
  google_key_configured: boolean;
  livekit_key_configured: boolean;
};

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
  return {
    brainProvider: row.brain_provider,
    brainModel: row.brain_model,
    voiceModel: row.voice_model,
    typegptKeyConfigured: row.typegpt_key_configured,
    googleKeyConfigured: row.google_key_configured,
    useOwnLiveKit: row.use_own_livekit,
    liveKitKeyConfigured: row.livekit_key_configured,
    liveKitUrl: row.livekit_url
  };
}

export async function updateCredentialRow(
  userId: string,
  payload: {
    brainProvider?: ModelProvider;
    brainModel?: string;
    voiceModel?: string;
    typegptApiKey?: string | null;
    googleApiKey?: string | null;
    useOwnLiveKit?: boolean;
    liveKitUrl?: string | null;
    liveKitApiKey?: string | null;
    liveKitApiSecret?: string | null;
  }
) {
  const current = await ensureCredentialRow(userId);
  const patch: Record<string, unknown> = {};

  if (payload.brainProvider) patch.brain_provider = payload.brainProvider;
  if (payload.brainModel) patch.brain_model = payload.brainModel;
  if (payload.voiceModel) patch.voice_model = payload.voiceModel;
  if (typeof payload.useOwnLiveKit === "boolean") patch.use_own_livekit = payload.useOwnLiveKit;
  if (payload.liveKitUrl !== undefined) patch.livekit_url = payload.liveKitUrl || null;

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

  if (payload.googleApiKey !== undefined && payload.googleApiKey !== null) {
    if (payload.googleApiKey.trim() === "") {
      patch.google_api_key_ciphertext = null;
      patch.google_key_configured = false;
      if ((payload.brainProvider ?? current.brain_provider) === "gemini") patch.brain_provider = "platform";
    } else {
      await validateGeminiKey(payload.googleApiKey);
      patch.google_api_key_ciphertext = encryptSecret(payload.googleApiKey);
      patch.google_key_configured = true;
    }
  }

  if (payload.liveKitApiKey !== undefined && payload.liveKitApiKey !== null) {
    patch.livekit_api_key_ciphertext = payload.liveKitApiKey.trim() ? encryptSecret(payload.liveKitApiKey) : null;
  }
  if (payload.liveKitApiSecret !== undefined && payload.liveKitApiSecret !== null) {
    patch.livekit_api_secret_ciphertext = payload.liveKitApiSecret.trim() ? encryptSecret(payload.liveKitApiSecret) : null;
  }
  if (
    payload.liveKitApiKey !== undefined ||
    payload.liveKitApiSecret !== undefined ||
    payload.useOwnLiveKit !== undefined
  ) {
    const nextKey =
      payload.liveKitApiKey && payload.liveKitApiKey.trim()
        ? true
        : current.livekit_key_configured && payload.liveKitApiKey === undefined;
    const nextSecret =
      payload.liveKitApiSecret && payload.liveKitApiSecret.trim()
        ? true
        : current.livekit_key_configured && payload.liveKitApiSecret === undefined;
    patch.livekit_key_configured = Boolean((payload.useOwnLiveKit ?? current.use_own_livekit) && nextKey && nextSecret);
  }

  const nextProvider = (patch.brain_provider as ModelProvider | undefined) ?? current.brain_provider;
  if (nextProvider === "typegpt" && !hasTypeGptCredential(current, patch)) {
    throw new ModelCredentialsError("No TypeGPT key is configured for the selected brain provider.");
  }
  if (nextProvider === "gemini" && !hasGoogleCredential(current, patch)) {
    throw new ModelCredentialsError("No Gemini key is configured for the selected brain provider.");
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
  if (typeof patch.typegpt_key_configured === "boolean") return patch.typegpt_key_configured || Boolean(env("PLATFORM_TYPEGPT_API_KEY"));
  return row.typegpt_key_configured || Boolean(env("PLATFORM_TYPEGPT_API_KEY"));
}

function hasGoogleCredential(row: CredentialRow, patch: Record<string, unknown>) {
  if (typeof patch.google_key_configured === "boolean") return patch.google_key_configured || Boolean(env("PLATFORM_GOOGLE_API_KEY"));
  return row.google_key_configured || Boolean(env("PLATFORM_GOOGLE_API_KEY"));
}

export async function resolveBrainModel(userId: string) {
  const row = await ensureCredentialRow(userId);
  let provider = row.brain_provider;
  let model = row.brain_model;
  let apiKey: string | null = null;
  let viaByok = false;

  if (provider === "platform") {
    model = env("PLATFORM_TYPEGPT_DEFAULT_MODEL", env("PLATFORM_GEMINI_BRAIN_MODEL", "gemini-2.5-flash"));
    const catalogModel = getBrainModel(model) ?? brainModels.find((item) => item.id === model);
    provider = catalogModel?.provider ?? (env("PLATFORM_TYPEGPT_API_KEY") ? "typegpt" : "gemini");
  }

  if (provider === "typegpt") {
    apiKey = decryptSecret(row.typegpt_api_key_ciphertext) ?? env("PLATFORM_TYPEGPT_API_KEY");
  } else if (provider === "gemini") {
    apiKey = decryptSecret(row.google_api_key_ciphertext) ?? env("PLATFORM_GOOGLE_API_KEY");
  }

  viaByok =
    provider === "typegpt"
      ? Boolean(row.typegpt_api_key_ciphertext)
      : provider === "gemini"
        ? Boolean(row.google_api_key_ciphertext)
        : false;

  if (!apiKey) throw new ModelCredentialsError(`No API key is configured for ${provider}.`);

  return { provider: provider as "typegpt" | "gemini", model, apiKey, viaByok };
}

export async function callBrainModel(userId: string, messages: ChatMessage[], temperature = 0.3) {
  const started = Date.now();
  const resolved = await resolveBrainModel(userId);
  const answer =
    resolved.provider === "typegpt"
      ? await callTypeGpt({ apiKey: resolved.apiKey, model: resolved.model, messages, temperature })
      : await callGeminiText({ apiKey: resolved.apiKey, model: resolved.model, messages, temperature });

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

export async function resolveLiveKitStack(userId: string) {
  const row = await ensureCredentialRow(userId);
  const googleApiKey = decryptSecret(row.google_api_key_ciphertext) ?? env("PLATFORM_GOOGLE_API_KEY");
  const voiceModel = getVoiceModel(row.voice_model)?.id ?? env("PLATFORM_GEMINI_LIVE_MODEL", "gemini-2.0-flash-live");

  let livekitUrl = env("LIVEKIT_URL");
  let livekitApiKey = env("LIVEKIT_API_KEY");
  let livekitApiSecret = env("LIVEKIT_API_SECRET");

  if (row.use_own_livekit) {
    livekitUrl = row.livekit_url ?? "";
    livekitApiKey = decryptSecret(row.livekit_api_key_ciphertext) ?? "";
    livekitApiSecret = decryptSecret(row.livekit_api_secret_ciphertext) ?? "";
  }

  const available =
    boolEnv("ALLOW_LIVEKIT", true) && Boolean(googleApiKey && livekitUrl && livekitApiKey && livekitApiSecret);

  return {
    available,
    googleApiKey,
    voiceModel,
    livekitUrl,
    livekitApiKey,
    livekitApiSecret,
    brainProvider: row.brain_provider,
    brainModel: row.brain_model,
    usesOwnLiveKit: row.use_own_livekit
  };
}

export async function liveKitConfigAvailable(userId: string) {
  return (await resolveLiveKitStack(userId)).available;
}
