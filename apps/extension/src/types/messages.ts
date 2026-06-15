import type { ExtractedPageContext, ResolvedVoiceMode, VoiceMode } from "@joblens/shared";

export type VoiceState =
  | "idle"
  | "preparing_context"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "ended";

export type ExtensionMessage =
  | { type: "PAGE_CONTEXT_READY"; payload: ExtractedPageContext }
  | { type: "VOICE_STATE_CHANGED"; payload: { state: VoiceState; message?: string; resolvedMode?: ResolvedVoiceMode } }
  | { type: "VOICE_MODE_CHANGED"; payload: { mode: VoiceMode } }
  | { type: "START_SESSION_REQUEST"; payload: { resumeId?: string } }
  | { type: "START_WEB_SPEECH"; payload: { page: ExtractedPageContext; voiceSessionId?: string } }
  | { type: "START_LIVEKIT_SESSION"; payload: { session: any; page: ExtractedPageContext } }
  | { type: "END_SESSION_REQUEST" }
  | { type: "TRANSCRIPT_APPENDED"; payload: { role: string; text: string } }
  | { type: "STORE_EXTENSION_TOKEN"; payload: { token: string; expiresAt?: string } }
  | { type: "ERROR"; payload: { code: string; message: string; fallbackMode?: string } };
