import type { ResolvedVoiceMode, VoiceMode } from "../voiceModes";

export interface VoicePreferences {
  defaultVoiceMode: VoiceMode;
  languageCode: string;
  webSpeechEnabled: boolean;
  autoFallbackEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  preferredBrowserVoice: string | null;
}

export interface VoiceStatePayload {
  state:
    | "idle"
    | "preparing_context"
    | "connecting"
    | "listening"
    | "thinking"
    | "speaking"
    | "error"
    | "ended";
  resolvedMode?: ResolvedVoiceMode;
  message?: string;
}
