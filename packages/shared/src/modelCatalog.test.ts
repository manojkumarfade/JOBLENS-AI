import { describe, expect, it } from "vitest";
import { brainModels, getModelLabel, voiceModels } from "./modelCatalog";

describe("model catalog", () => {
  it("contains the required brain and voice models", () => {
    expect(brainModels.map((model) => model.id)).toEqual([
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "mistralai/ministral-14b-instruct-2512",
      "qwen/qwen3-next-80b-a3b-instruct",
      "gemini-2.5-flash",
      "gemini-2.5-pro"
    ]);
    expect(voiceModels[0]?.id).toBe("gemini-2.0-flash-live");
  });

  it("resolves display labels", () => {
    expect(getModelLabel("gemini-2.5-flash")).toBe("Gemini 2.5 Flash");
    expect(getModelLabel("unknown-model")).toBe("unknown-model");
  });
});
