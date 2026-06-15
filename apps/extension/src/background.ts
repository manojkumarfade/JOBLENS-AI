import { clearExtensionToken, getExtensionToken, loadStartupState, setExtensionToken } from "./apiClient";
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

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.extensionToken) return;
  void broadcastAuthState(Boolean(changes.extensionToken.newValue));
});

async function storeExtensionToken(token: string, expiresAt?: string) {
  await setExtensionToken(token, expiresAt);
  await loadStartupState();
  await broadcastAuthState(true);
  return { ok: true };
}

async function removeExtensionToken() {
  await clearExtensionToken();
  await broadcastAuthState(false);
  return { ok: true };
}

async function broadcastAuthState(signedIn: boolean) {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs
      .filter((tab) => typeof tab.id === "number")
      .map((tab) =>
        chrome.tabs
          .sendMessage(tab.id!, { type: "AUTH_STATE_CHANGED", payload: { signedIn } } satisfies ExtensionMessage)
          .catch(() => null)
      )
  );
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
  if (message.type === "GET_AUTH_STATE") {
    return { ok: true, signedIn: Boolean(await getExtensionToken()) };
  }

  if (message.type === "STORE_EXTENSION_TOKEN") {
    return storeExtensionToken(message.payload.token, message.payload.expiresAt);
  }

  if (message.type === "CLEAR_EXTENSION_TOKEN") {
    return removeExtensionToken();
  }

  if (message.type === "SYNC_STARTUP_STATE") {
    const state = await loadStartupState();
    return { ok: true, ...state, signedIn: Boolean(await getExtensionToken()) };
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

    const resolvedMode = resolveVoiceMode({
      browserSupportsWebSpeech: true
    });

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
    await loadStartupState();
    return { ok: true };
  }

  return { ok: true };
}
