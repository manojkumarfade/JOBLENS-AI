import { API_BASE_URL } from "./config";

export async function getExtensionToken() {
  const stored = await chrome.storage.local.get(["extensionToken"]);
  return typeof stored.extensionToken === "string" ? stored.extensionToken : null;
}

export async function setExtensionToken(token: string, expiresAt?: string) {
  await chrome.storage.local.set({ extensionToken: token, extensionTokenExpiresAt: expiresAt ?? null });
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getExtensionToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {})
    }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = body.error ?? { code: "REQUEST_FAILED", message: "JobLens request failed." };
    throw Object.assign(new Error(error.message), error);
  }
  return body as T;
}

export async function loadStartupState() {
  const [preferences, credentials, catalog] = await Promise.all([
    apiFetch<any>("/api/voice/preferences").catch(() => null),
    apiFetch<any>("/api/settings/model-credentials").catch(() => null),
    apiFetch<any>("/api/models/catalog").catch(() => null)
  ]);
  await chrome.storage.local.set({ preferences, credentials, catalog, lastSyncedAt: new Date().toISOString() });
  return { preferences, credentials, catalog };
}
