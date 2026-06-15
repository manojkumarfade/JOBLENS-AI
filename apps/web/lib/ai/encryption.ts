import crypto from "crypto";
import { requiredEnv } from "../env";

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function keyBytes() {
  const raw = requiredEnv("CREDENTIALS_ENCRYPTION_KEY");
  const decoded = Buffer.from(raw, "base64");
  if (decoded.length !== 32) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY must be a 32-byte base64 value");
  }
  return decoded;
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBytes(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, tag]).toString("base64");
}

export function decryptSecret(value: string | null | undefined) {
  if (!value) return null;
  const packed = Buffer.from(value, "base64");
  if (packed.length <= IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid encrypted secret payload");
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const tag = packed.subarray(packed.length - TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH, packed.length - TAG_LENGTH);
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
