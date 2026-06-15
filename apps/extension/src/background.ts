import type { VoiceMode } from "@joblens/shared";
import { apiFetch, loadStartupState, setExtensionToken } from "./apiClient";
import type { ExtensionMessage } from "./types/messages";
import { resolveVoiceMode } from "./voice/modeResolver";

chrome.runtime.onInstalled.addListener(() => {
  void loadStartupState();
});

chrome.runtime.onStartup?.addListener(() => {
  void loadStartupState();
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  void handleMessage(message, sender).then(sendResponse).catch((error) => {
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "ERROR",
        payload: { code: error.code ?? "EXTENSION_ERROR", message: error.message ?? "JobLens failed." }
      } satisfies ExtensionMessage);
    }
    sendResponse({ ok: false });
  });
  return true;
});

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  void handleExternalMessage(message)
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : "Could not sign in extension." }));
  return true;
});

async function storeExtensionToken(token: string, expiresAt?: string) {
  await setExtensionToken(token, expiresAt);
  await loadStartupState();
  return { ok: true };
}

async function handleExternalMessage(message: unknown) {
  if (!message || typeof message !== "object") return { ok: false };
  const incoming = message as { type?: string; payload?: { token?: string; expiresAt?: string } };
  if (incoming.type === "STORE_EXTENSION_TOKEN" && incoming.payload?.token) {
    return storeExtensionToken(incoming.payload.token, incoming.payload.expiresAt);
  }
  return { ok: false };
}

async function handleMessage(message: ExtensionMessage, sender: chrome.runtime.MessageSender) {
  if (message.type === "STORE_EXTENSION_TOKEN") {
    return storeExtensionToken(message.payload.token, message.payload.expiresAt);
  }

  if (message.type === "PAGE_CONTEXT_READY") {
    if (!sender.tab?.id) return { ok: false };
    const state = await loadStartupState();
    if (!state.preferences) {
      await chrome.tabs.sendMessage(sender.tab.id, {
        type: "ERROR",
        payload: { code: "AUTH_REQUIRED", message: "Sign in from the JobLens extension popup." }
      } satisfies ExtensionMessage);
      return { ok: false };
    }

    const preferredMode = (state.preferences.defaultVoiceMode ?? "auto") as VoiceMode;
    const resolvedMode = resolveVoiceMode({
      preferredMode,
      browserSupportsWebSpeech: true,
      liveKitEnabledForUser: Boolean(state.preferences.liveKitEnabled),
      liveKitConfigAvailable: Boolean(state.preferences.liveKitConfigAvailable),
      microphonePermission: "prompt"
    });

    if (resolvedMode === "livekit_gemini") {
      try {
        await chrome.tabs.sendMessage(sender.tab.id, {
          type: "VOICE_STATE_CHANGED",
          payload: { state: "connecting", resolvedMode }
        } satisfies ExtensionMessage);
        const session = await apiFetch<any>("/api/livekit/start-session", {
          method: "POST",
          body: JSON.stringify({ preferredVoiceMode: preferredMode, page: message.payload })
        });
        await chrome.tabs.sendMessage(sender.tab.id, {
          type: "START_LIVEKIT_SESSION",
          payload: { session, page: message.payload }
        } satisfies ExtensionMessage);
      } catch (error: any) {
        await chrome.tabs.sendMessage(sender.tab.id, {
          type: "ERROR",
          payload: {
            code: error.code ?? "VOICE_MODE_UNAVAILABLE",
            message: error.message ?? "Natural Call Voice could not start.",
            fallbackMode: error.fallbackMode ?? "web_speech"
          }
        } satisfies ExtensionMessage);
      }
      return { ok: true };
    }

    if (resolvedMode === "web_speech") {
      await chrome.tabs.sendMessage(sender.tab.id, {
        type: "START_WEB_SPEECH",
        payload: { page: message.payload }
      } satisfies ExtensionMessage);
      return { ok: true };
    }

    await chrome.tabs.sendMessage(sender.tab.id, {
      type: "ERROR",
      payload: { code: "VOICE_MODE_UNAVAILABLE", message: "Voice is unavailable in this browser. Use text input in the dashboard." }
    } satisfies ExtensionMessage);
  }

  if (message.type === "VOICE_MODE_CHANGED") {
    await apiFetch("/api/voice/preferences", {
      method: "PATCH",
      body: JSON.stringify({ defaultVoiceMode: message.payload.mode })
    });
    await loadStartupState();
    return { ok: true };
  }

  return { ok: true };
}
