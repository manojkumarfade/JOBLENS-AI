import { describe, expect, it } from "vitest";
import { resolveVoiceMode } from "./modeResolver";

describe("resolveVoiceMode", () => {
  it("uses Web Speech when the browser supports it", () => {
    expect(resolveVoiceMode({ browserSupportsWebSpeech: true })).toBe("web_speech");
  });

  it("uses text only when Web Speech is unavailable", () => {
    expect(resolveVoiceMode({ browserSupportsWebSpeech: false })).toBe("text_only");
  });
});
