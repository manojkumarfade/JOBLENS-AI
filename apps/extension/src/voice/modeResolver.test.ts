import { describe, expect, it } from "vitest";
import { resolveVoiceMode } from "./modeResolver";

describe("resolveVoiceMode", () => {
  it("falls back from Natural Call to Web Speech when LiveKit is unavailable", () => {
    expect(
      resolveVoiceMode({
        preferredMode: "livekit_gemini",
        browserSupportsWebSpeech: true,
        liveKitEnabledForUser: false,
        liveKitConfigAvailable: false,
        microphonePermission: "prompt"
      })
    ).toBe("web_speech");
  });

  it("uses text only when no voice mode is available", () => {
    expect(
      resolveVoiceMode({
        preferredMode: "auto",
        browserSupportsWebSpeech: false,
        liveKitEnabledForUser: false,
        liveKitConfigAvailable: false,
        microphonePermission: "denied"
      })
    ).toBe("text_only");
  });
});
