import type { ResolvedVoiceMode, VoiceMode } from "../voiceModes";

export interface VoicePreferences {
  defaultVoiceMode: VoiceMode;
  languageCode: string;
  webSpeechEnabled: boolean;
  liveKitEnabled: boolean;
  autoFallbackEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  preferredBrowserVoice: string | null;
  liveKitConfigAvailable?: boolean;
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
