import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./encryption";

describe("BYOK encryption", () => {
  it("roundtrips without exposing plaintext in ciphertext", () => {
    process.env.CREDENTIALS_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    const encrypted = encryptSecret("sk-test-value");
    expect(encrypted).not.toContain("sk-test-value");
    expect(decryptSecret(encrypted)).toBe("sk-test-value");
  });
});
