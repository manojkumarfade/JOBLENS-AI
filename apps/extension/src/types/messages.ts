import type { ExtractedPageContext, ResolvedVoiceMode, VoiceMode } from "@joblens/shared";
import type { TranscriptTurn } from "../voice/transcriptStore";

export type VoiceState =
  | "idle"
  | "preparing_context"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "ended";

export type ExtensionMessage =
  | { type: "GET_AUTH_STATE" }
  | { type: "AUTH_STATE_CHANGED"; payload: { signedIn: boolean } }
  | { type: "PAGE_CONTEXT_READY"; payload: ExtractedPageContext }
  | { type: "VOICE_STATE_CHANGED"; payload: { state: VoiceState; message?: string; resolvedMode?: ResolvedVoiceMode } }
  | { type: "VOICE_MODE_CHANGED"; payload: { mode: VoiceMode } }
  | { type: "START_SESSION_REQUEST"; payload: { resumeId?: string } }
  | { type: "START_WEB_SPEECH"; payload: { page: ExtractedPageContext; voiceSessionId?: string } }
  | { type: "END_SESSION_REQUEST" }
  | { type: "TRANSCRIPT_APPENDED"; payload: TranscriptTurn }
  | { type: "STORE_EXTENSION_TOKEN"; payload: { token: string; expiresAt?: string } }
  | { type: "CLEAR_EXTENSION_TOKEN" }
  | { type: "SYNC_STARTUP_STATE" }
  | { type: "ERROR"; payload: { code: string; message: string; fallbackMode?: string } };
