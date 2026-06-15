import { describe, expect, it } from "vitest";
import { brainModels, getModelLabel } from "./modelCatalog";

describe("model catalog", () => {
  it("contains the required brain and voice models", () => {
    expect(brainModels.map((model) => model.id)).toEqual([
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "mistralai/ministral-14b-instruct-2512",
      "qwen/qwen3-next-80b-a3b-instruct"
    ]);
  });

  it("resolves display labels", () => {
    expect(getModelLabel("openai/gpt-oss-20b")).toBe("GPT-OSS 20B");
    expect(getModelLabel("unknown-model")).toBe("unknown-model");
  });
});
