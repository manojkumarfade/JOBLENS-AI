import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ExtractedPageContext } from "@joblens/shared";
import { API_BASE_URL } from "./config";
import { extractPageContext } from "./extractor";
import type { ExtensionMessage } from "./types/messages";
import { FloatingButton } from "./ui/FloatingButton";
import { TranscriptOverlay } from "./ui/TranscriptOverlay";
import {
  startConversation,
  type ConversationHandle,
  type ConversationState,
  type VoiceOption
} from "./voice/webSpeechController";

installTokenBridge();

if (isSupportedPage()) {
  const host = document.createElement("div");
  host.id = "joblens-voice-root";
  const shadow = host.attachShadow({ mode: "open" });
  document.documentElement.appendChild(host);

  const mount = document.createElement("div");
  mount.className = "jl-root";
  shadow.appendChild(mount);

  createRoot(mount).render(<JobLensContentApp />);
}

function JobLensContentApp() {
  const [authLoaded, setAuthLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [assistantSubtitle, setAssistantSubtitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [debugMessage, setDebugMessage] = useState("");
  const [voiceSessionId, setVoiceSessionId] = useState<string>();
  const conversationRef = useRef<ConversationHandle | null>(null);

  useEffect(() => {
    chrome.runtime
      .sendMessage({ type: "GET_AUTH_STATE" } satisfies ExtensionMessage)
      .then((response) => {
        setSignedIn(Boolean(response?.signedIn));
        setAuthLoaded(true);
      })
      .catch(() => setAuthLoaded(true));

    const runtimeListener = (incoming: ExtensionMessage) => {
      if (incoming.type === "AUTH_STATE_CHANGED") {
        setSignedIn(incoming.payload.signedIn);
        if (!incoming.payload.signedIn) resetConversation();
      }
      if (incoming.type === "ERROR") {
        setConversationState("error");
        setErrorMessage(incoming.payload.message);
      }
    };

    const storageListener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName !== "local") return;
      if (changes.extensionToken) {
        const nextSignedIn = Boolean(changes.extensionToken.newValue);
        setSignedIn(nextSignedIn);
        if (!nextSignedIn) resetConversation();
      }
    };

    chrome.runtime.onMessage.addListener(runtimeListener);
    chrome.storage.onChanged.addListener(storageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(runtimeListener);
      chrome.storage.onChanged.removeListener(storageListener);
      conversationRef.current?.stop();
      conversationRef.current = null;
    };
  }, []);

  async function loadVoiceSettings() {
    const stored = await chrome.storage.local.get(["voiceId", "voiceSessionId", "voiceDebug"]);
    return {
      voiceId: (stored.voiceId as VoiceOption["id"] | undefined) ?? "voice_a",
      voiceSessionId: (stored.voiceSessionId as string | undefined) ?? voiceSessionId,
      debug: stored.voiceDebug === true
    };
  }

  function resetConversation() {
    conversationRef.current?.stop();
    conversationRef.current = null;
    setConversationState("idle");
    setInterimTranscript("");
    setFinalTranscript("");
    setAssistantSubtitle("");
    setErrorMessage("");
    setDebugMessage("");
  }

  async function onFabClick() {
    if (!signedIn) return;
    if (conversationRef.current) {
      resetConversation();
      return;
    }

    setConversationState("preparing");
    setInterimTranscript("");
    setFinalTranscript("");
    setAssistantSubtitle("");
    setErrorMessage("");
    setDebugMessage("");
    const page: ExtractedPageContext = extractPageContext();
    const settings = await loadVoiceSettings().catch(() => ({ voiceId: "voice_a" as const, voiceSessionId, debug: false }));

    conversationRef.current = startConversation(
      page,
      {
        onState(state, detail) {
          setConversationState(state);
          if (detail && state !== "error") setDebugMessage(detail);
          if (state === "ended" || state === "idle") {
            setInterimTranscript("");
            setFinalTranscript("");
            setAssistantSubtitle("");
            setErrorMessage("");
          } else if (state === "error" && detail) {
            setErrorMessage(detail);
          }
          if (state === "ended" || state === "error") {
            conversationRef.current = null;
          }
        },
        onTranscript(update) {
          setInterimTranscript(update.interimTranscript);
          setFinalTranscript(update.finalTranscript);
        },
        onAssistantSubtitle(text) {
          setAssistantSubtitle(text);
        },
        onSessionId(id) {
          setVoiceSessionId(id);
          void chrome.storage.local.set({ voiceSessionId: id });
        },
        onDebug(message) {
          setDebugMessage(message);
        },
        onError(message) {
          setErrorMessage(message);
        }
      },
      { voiceId: settings.voiceId, voiceSessionId: settings.voiceSessionId, debug: settings.debug }
    );
  }

  function onEndCall() {
    resetConversation();
  }

  if (!authLoaded || !signedIn) return null;

  return (
    <>
      <TranscriptOverlay
        state={conversationState}
        interimTranscript={interimTranscript}
        finalTranscript={finalTranscript}
        assistantSubtitle={assistantSubtitle}
        errorMessage={errorMessage}
        debugMessage={debugMessage}
      />
      <FloatingButton
        state={conversationState}
        active={conversationRef.current !== null}
        onClick={onFabClick}
        onEndCall={onEndCall}
      />
    </>
  );
}

function installTokenBridge() {
  const apiOrigin = getApiOrigin();
  if (!apiOrigin) return;

  function receiveToken(event: MessageEvent) {
    if (event.source !== window || event.origin !== apiOrigin) return;
    const data = event.data as { type?: string; extensionToken?: string; expiresAt?: string };
    if (data?.type === "JOBLENS_EXTENSION_TOKEN" && data.extensionToken) {
      chrome.runtime.sendMessage({ type: "STORE_EXTENSION_TOKEN", payload: { token: data.extensionToken, expiresAt: data.expiresAt } } satisfies ExtensionMessage);
    }
    if (data?.type === "JOBLENS_EXTENSION_STATUS_REQUEST") {
      chrome.runtime
        .sendMessage({ type: "GET_AUTH_STATE" } satisfies ExtensionMessage)
        .then((response) => {
          window.postMessage(
            {
              type: "JOBLENS_EXTENSION_STATUS_RESPONSE",
              installed: true,
              signedIn: Boolean(response?.signedIn)
            },
            apiOrigin
          );
        })
        .catch(() => null);
    }
  }

  window.addEventListener("message", receiveToken);
}

function getApiOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return null;
  }
}

function isSupportedPage() {
  try {
    const url = new URL(window.location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.hostname === "chrome.google.com" && url.pathname.startsWith("/webstore")) return false;
    if (url.hostname === "chromewebstore.google.com") return false;
    if (document.contentType === "application/pdf") return false;
    if (url.pathname.toLowerCase().endsWith(".pdf")) return false;
    return true;
  } catch {
    return false;
  }
}
