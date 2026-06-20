import { SignJWT, jwtVerify } from "jose";
import { requiredEnv } from "../env";

const encoder = new TextEncoder();

function signingKey() {
  return encoder.encode(requiredEnv("EXTENSION_AUTH_SECRET"));
}

export async function signExtensionToken(input: { userId: string; email?: string | null; extensionId?: string | null }) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const token = await new SignJWT({
    email: input.email ?? null,
    extensionId: input.extensionId ?? null,
    scope: "extension"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuer("joblens-web")
    .setAudience("joblens-extension")
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(signingKey());

  return { token, expiresAt: expiresAt.toISOString() };
}

export async function verifyExtensionToken(token: string) {
  const { payload } = await jwtVerify(token, signingKey(), {
    issuer: "joblens-web",
    audience: "joblens-extension"
  });

  if (payload.scope !== "extension" || !payload.sub) {
    throw new Error("Invalid extension token");
  }

  return {
    id: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null
  };
}
