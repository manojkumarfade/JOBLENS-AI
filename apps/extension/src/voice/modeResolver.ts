import type { ResolvedVoiceMode, VoiceMode } from "@joblens/shared";

export function resolveVoiceMode(input: {
  preferredMode: VoiceMode;
  browserSupportsWebSpeech: boolean;
  liveKitEnabledForUser: boolean;
  liveKitConfigAvailable: boolean;
  microphonePermission: "granted" | "denied" | "prompt";
}): ResolvedVoiceMode {
  if (input.preferredMode === "web_speech") {
    return input.browserSupportsWebSpeech ? "web_speech" : "text_only";
  }
  if (input.preferredMode === "livekit_gemini") {
    if (input.liveKitEnabledForUser && input.liveKitConfigAvailable) return "livekit_gemini";
    return input.browserSupportsWebSpeech ? "web_speech" : "text_only";
  }
  if (input.liveKitEnabledForUser && input.liveKitConfigAvailable) return "livekit_gemini";
  return input.browserSupportsWebSpeech ? "web_speech" : "text_only";
}
