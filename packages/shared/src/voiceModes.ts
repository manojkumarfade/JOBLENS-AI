export const voiceModes = ["web_speech"] as const;
export type VoiceMode = (typeof voiceModes)[number];

export const resolvedVoiceModes = ["web_speech", "text_only"] as const;
export type ResolvedVoiceMode = (typeof resolvedVoiceModes)[number];

export const voiceModeLabels: Record<VoiceMode, string> = {
  web_speech: "Voice Conversation"
};

export const resolvedVoiceModeLabels: Record<ResolvedVoiceMode, string> = {
  web_speech: "Voice Conversation",
  text_only: "Text Only"
};
