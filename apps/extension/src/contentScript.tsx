import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ExtractedPageContext, VoiceMode } from "@joblens/shared";
import { getModelLabel } from "@joblens/shared";
import { API_BASE_URL } from "./config";
import { extractPageContext } from "./extractor";
import type { ExtensionMessage, VoiceState } from "./types/messages";
import { FloatingButton } from "./ui/FloatingButton";
import { VoicePanel } from "./ui/VoicePanel";
import { endLiveKitSession, startLiveKitSession } from "./voice/liveKitController";
import { clearTranscripts, getTranscripts } from "./voice/transcriptStore";
import { startWebSpeechSession } from "./voice/webSpeechController";

type RuntimePrefs = { defaultVoiceMode?: VoiceMode };
type RuntimeCreds = { brainModel?: string; brainProvider?: string };

const host = document.createElement("div");
host.id = "joblens-voice-root";
const shadow = host.attachShadow({ mode: "open" });
document.documentElement.appendChild(host);

const style = document.createElement("style");
style.textContent = `
  :host { all: initial; }
  .jl-root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #142018; }
  .jl-floating-button { position: fixed; right: 22px; bottom: 22px; z-index: 2147483647; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; max-width: 280px; border: 0; border-radius: 999px; padding: 12px 16px; background: #4c9a68; color: white; box-shadow: 0 18px 40px rgba(12,24,18,.22); cursor: pointer; font-size: 14px; font-weight: 700; }
  .jl-panel { position: fixed; right: 22px; bottom: 82px; z-index: 2147483647; width: min(360px, calc(100vw - 32px)); border: 1px solid rgba(20,32,24,.15); border-radius: 8px; background: rgba(255,255,255,.98); box-shadow: 0 20px 50px rgba(12,24,18,.24); padding: 14px; box-sizing: border-box; }
  .jl-panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .jl-panel-header strong { display: block; font-size: 14px; line-height: 1.4; }
  .jl-panel-badges { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
  .jl-badge { display: inline-flex; align-items: center; border-radius: 6px; background: #e8f4ec; color: #1b5f36; padding: 4px 7px; font-size: 11px; font-weight: 700; }
  .jl-badge-muted { background: #eef1f0; color: #34433a; }
  .jl-icon-button { border: 0; background: transparent; color: #34433a; font-size: 24px; line-height: 1; cursor: pointer; }
  .jl-wave { height: 36px; display: flex; align-items: center; gap: 5px; margin: 14px 0; }
  .jl-wave span { width: 6px; height: 14px; border-radius: 99px; background: #4c9a68; animation: jl-wave 950ms ease-in-out infinite; }
  .jl-wave span:nth-child(2) { animation-delay: 120ms; height: 26px; }
  .jl-wave span:nth-child(3) { animation-delay: 240ms; height: 20px; }
  .jl-wave span:nth-child(4) { animation-delay: 360ms; height: 30px; }
  @keyframes jl-wave { 0%,100% { transform: scaleY(.55); opacity: .55; } 50% { transform: scaleY(1); opacity: 1; } }
  .jl-error { border: 1px solid #f2b6b6; background: #fff4f4; color: #7d2020; border-radius: 8px; padding: 10px; font-size: 12px; display: grid; gap: 8px; }
  .jl-error button { border: 1px solid #7d2020; border-radius: 6px; background: white; color: #7d2020; padding: 6px 8px; cursor: pointer; }
  .jl-transcripts { display: grid; gap: 8px; max-height: 180px; overflow: auto; font-size: 12px; line-height: 1.5; color: #34433a; }
  .jl-turn { margin: 0; border-radius: 8px; background: #f6f8f7; padding: 8px; }
  .jl-turn span { font-weight: 700; text-transform: capitalize; }
`;
shadow.appendChild(style);
const mount = document.createElement("div");
mount.className = "jl-root";
shadow.appendChild(mount);

function JobLensContentApp() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [state, setState] = useState<VoiceState>("idle");
  const [message, setMessage] = useState<string>();
  const [page, setPage] = useState<ExtractedPageContext | null>(null);
  const [mode, setMode] = useState<VoiceMode>("auto");
  const [modelLabel, setModelLabel] = useState("Platform model");
  const [transcripts, setTranscripts] = useState<Array<{ role: string; text: string }>>([]);
  const [voiceSessionId, setVoiceSessionId] = useState<string>();

  useEffect(() => {
    chrome.storage.local.get(["preferences", "credentials", "catalog"]).then((stored) => {
      const prefs = stored.preferences as RuntimePrefs | null;
      const creds = stored.credentials as RuntimeCreds | null;
      if (prefs?.defaultVoiceMode) setMode(prefs.defaultVoiceMode);
      if (creds?.brainModel) setModelLabel(getModelLabel(creds.brainModel));
    });

    const listener = (incoming: ExtensionMessage) => {
      if (incoming.type === "VOICE_STATE_CHANGED") {
        setState(incoming.payload.state);
        setMessage(incoming.payload.message);
      }
      if (incoming.type === "START_WEB_SPEECH") {
        setPanelOpen(true);
        setPage(incoming.payload.page);
        startWebSpeech(incoming.payload.page, incoming.payload.voiceSessionId);
      }
      if (incoming.type === "START_LIVEKIT_SESSION") {
        setPanelOpen(true);
        setVoiceSessionId(incoming.payload.session.voiceSessionId);
        startLiveKitSession({
          page: incoming.payload.page,
          session: incoming.payload.session,
          onState: (next, nextMessage) => {
            setState(next as VoiceState);
            if (nextMessage) setModelLabel(getModelLabel(nextMessage));
          }
        });
      }
      if (incoming.type === "ERROR") {
        setPanelOpen(true);
        setState("error");
        setMessage(incoming.payload.message);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    function receiveToken(event: MessageEvent) {
      if (event.source !== window) return;
      if (!API_BASE_URL.startsWith(event.origin)) return;
      const data = event.data as { type?: string; extensionToken?: string; expiresAt?: string };
      if (data?.type === "JOBLENS_EXTENSION_TOKEN" && data.extensionToken) {
        chrome.runtime.sendMessage({ type: "STORE_EXTENSION_TOKEN", payload: { token: data.extensionToken, expiresAt: data.expiresAt } });
      }
    }
    window.addEventListener("message", receiveToken);
    return () => window.removeEventListener("message", receiveToken);
  }, []);

  const currentTranscripts = useMemo(() => transcripts, [transcripts]);

  function startWebSpeech(extractedPage: ExtractedPageContext, sessionId?: string) {
    startWebSpeechSession({
      page: extractedPage,
      voiceSessionId: sessionId,
      onState: (next, nextMessage) => {
        setState(next as VoiceState);
        if (nextMessage) setModelLabel(getModelLabel(nextMessage));
      },
      onTranscript: (role, text) => setTranscripts((turns) => [...turns, { role, text }])
    });
  }

  function onClick() {
    setPanelOpen(true);
    setState("preparing_context");
    clearTranscripts();
    setTranscripts([]);
    const extracted = extractPageContext();
    setPage(extracted);
    chrome.runtime.sendMessage({ type: "PAGE_CONTEXT_READY", payload: extracted } satisfies ExtensionMessage);
  }

  async function end() {
    setState("ended");
    await endLiveKitSession(voiceSessionId);
  }

  return (
    <>
      <FloatingButton onClick={onClick} />
      {panelOpen ? (
        <VoicePanel
          state={state}
          mode={mode}
          modelLabel={modelLabel}
          message={message}
          transcripts={currentTranscripts}
          onEnd={end}
          onFallback={page ? () => startWebSpeech(page, voiceSessionId) : undefined}
        />
      ) : null}
    </>
  );
}

createRoot(mount).render(<JobLensContentApp />);
