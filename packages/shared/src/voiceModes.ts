export const voiceModes = ["auto", "web_speech", "livekit_gemini"] as const;
export type VoiceMode = (typeof voiceModes)[number];

export const resolvedVoiceModes = ["web_speech", "livekit_gemini", "text_only"] as const;
export type ResolvedVoiceMode = (typeof resolvedVoiceModes)[number];

export const voiceModeLabels: Record<VoiceMode, string> = {
  auto: "Auto Select",
  web_speech: "Fast & Free Voice",
  livekit_gemini: "Natural Call Voice"
};

export const resolvedVoiceModeLabels: Record<ResolvedVoiceMode, string> = {
  web_speech: "Fast & Free Voice",
  livekit_gemini: "Natural Call Voice",
  text_only: "Text Only"
};
