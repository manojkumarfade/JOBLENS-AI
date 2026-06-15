import { API_BASE_URL } from "./config";

export async function getExtensionToken() {
  const stored = await chrome.storage.local.get(["extensionToken", "extensionTokenExpiresAt"]);
  if (typeof stored.extensionToken !== "string") return null;
  if (typeof stored.extensionTokenExpiresAt === "string" && Date.parse(stored.extensionTokenExpiresAt) <= Date.now()) {
    await clearExtensionToken();
    return null;
  }
  return stored.extensionToken;
}

export async function setExtensionToken(token: string, expiresAt?: string) {
  await chrome.storage.local.set({ extensionToken: token, extensionTokenExpiresAt: expiresAt ?? null });
}

export async function clearExtensionToken() {
  await chrome.storage.local.remove(["extensionToken", "extensionTokenExpiresAt", "preferences", "credentials"]);
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
  const token = await getExtensionToken();
  if (!token) {
    await chrome.storage.local.set({ preferences: null, credentials: null, lastSyncedAt: new Date().toISOString() });
    const catalog = await apiFetch<any>("/api/models/catalog").catch(() => null);
    if (catalog) await chrome.storage.local.set({ catalog });
    return { preferences: null, credentials: null, catalog };
  }

  const [preferences, credentials, catalog] = await Promise.all([
    apiFetch<any>("/api/voice/preferences").catch(() => null),
    apiFetch<any>("/api/settings/model-credentials").catch(() => null),
    apiFetch<any>("/api/models/catalog").catch(() => null)
  ]);
  await chrome.storage.local.set({ preferences, credentials, catalog, lastSyncedAt: new Date().toISOString() });
  return { preferences, credentials, catalog };
}
