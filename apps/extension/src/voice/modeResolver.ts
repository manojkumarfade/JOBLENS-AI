import type { ResolvedVoiceMode } from "@joblens/shared";

export function resolveVoiceMode(input: { browserSupportsWebSpeech: boolean }): ResolvedVoiceMode {
  return input.browserSupportsWebSpeech ? "web_speech" : "text_only";
}
