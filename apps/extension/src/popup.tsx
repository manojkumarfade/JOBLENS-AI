import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getModelLabel } from "@joblens/shared";
import { API_BASE_URL } from "./config";
import { getExtensionToken, loadStartupState } from "./apiClient";
import type { ExtensionMessage } from "./types/messages";
import { speakTestVoice, VOICE_OPTIONS, type VoiceOption } from "./voice/webSpeechController";

function Popup() {
  const [signedIn, setSignedIn] = useState(false);
  const [model, setModel] = useState("Platform Default");
  const [voiceId, setVoiceId] = useState<VoiceOption["id"]>("voice_a");
  const [voiceDebug, setVoiceDebug] = useState(false);
  const [message, setMessage] = useState("");
  const [syncing, setSyncing] = useState(false);
  const extensionId = chrome.runtime.id;

  async function load() {
    const token = await getExtensionToken();
    setSignedIn(Boolean(token));
    const stored = await chrome.storage.local.get(["voiceId", "voiceDebug"]);
    if (typeof stored.voiceId === "string" && VOICE_OPTIONS.some((option) => option.id === stored.voiceId)) {
      setVoiceId(stored.voiceId as VoiceOption["id"]);
    }
    setVoiceDebug(stored.voiceDebug === true);
    if (!token) return;
    const state = await loadStartupState().catch(() => null);
    if (state?.credentials?.brainModel) setModel(getModelLabel(state.credentials.brainModel));
  }

  useEffect(() => {
    void load();
  }, []);

  async function refresh() {
    setSyncing(true);
    setMessage("");
    await chrome.runtime.sendMessage({ type: "SYNC_STARTUP_STATE" } satisfies ExtensionMessage).catch(() => null);
    await load();
    setMessage("Status refreshed.");
    setSyncing(false);
  }

  async function signOut() {
    await chrome.runtime.sendMessage({ type: "CLEAR_EXTENSION_TOKEN" } satisfies ExtensionMessage).catch(() => null);
    setSignedIn(false);
    setMessage("Signed out of the extension.");
  }

  async function changeVoiceStyle(next: VoiceOption["id"]) {
    setVoiceId(next);
    await chrome.storage.local.set({ voiceId: next });
    setMessage("Voice style updated.");
  }

  async function toggleDebug() {
    const next = !voiceDebug;
    setVoiceDebug(next);
    await chrome.storage.local.set({ voiceDebug: next });
    setMessage(next ? "Voice debug overlay enabled." : "Voice debug overlay disabled.");
  }

  async function testMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMessage("Microphone works. If a site still blocks it, allow mic permission for that site.");
    } catch {
      setMessage("Microphone blocked or unavailable. Allow mic permission for this site and use Chrome/Edge.");
    }
  }

  async function testVoice() {
    try {
      await speakTestVoice(voiceId);
      setMessage("Voice output works.");
    } catch {
      setMessage("Voice output failed. Check browser audio settings.");
    }
  }

  async function copyExtensionId() {
    await navigator.clipboard.writeText(extensionId);
    setMessage("Extension ID copied. Paste it in the candidate dashboard before signing in.");
  }

  function openExtensionLogin() {
    chrome.tabs.create({ url: `${API_BASE_URL}/login?from=extension&extensionId=${encodeURIComponent(extensionId)}` });
  }

  useEffect(() => {
    function onStorageChanged(changes: Record<string, chrome.storage.StorageChange>, areaName: string) {
      if (areaName === "local" && changes.extensionToken) {
        setSignedIn(Boolean(changes.extensionToken.newValue));
        void load();
      }
    }

    chrome.storage.onChanged.addListener(onStorageChanged);
    return () => chrome.storage.onChanged.removeListener(onStorageChanged);
  }, []);

  return (
    <main>
      <header>
        <div>
          <h1>JobLens AI Browser Copilot</h1>
          <p>{signedIn ? "Signed in" : "Not signed in"}</p>
        </div>
        <button type="button" onClick={refresh} disabled={syncing}>{syncing ? "Syncing" : "Sync"}</button>
      </header>

      <section>
        <h2>Backend</h2>
        <p className="mono">{API_BASE_URL}</p>
      </section>

      <section>
        <h2>Extension ID</h2>
        <p className="mono">{extensionId}</p>
        <p style={{ marginTop: 8 }}>Paste this ID into the candidate dashboard to link the extension securely.</p>
        <button type="button" onClick={copyExtensionId} style={{ marginTop: 8 }}>Copy extension ID</button>
      </section>

      <section>
        <h2>Voice mode</h2>
        <p className="badge">Browser Web Voice</p>
        <p style={{ marginTop: 8 }}>If mic does not work, allow microphone permission for the current site and use Chrome/Edge.</p>
      </section>

      {!signedIn ? (
        <button className="primary" type="button" onClick={openExtensionLogin}>
          Sign in
        </button>
      ) : null}

      <section>
        <h2>Voice style:</h2>
        <select value={voiceId} onChange={(event) => changeVoiceStyle(event.target.value as VoiceOption["id"])} disabled={!signedIn}>
          {VOICE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </section>

      <section>
        <h2>Tests</h2>
        <div className="links">
          <button type="button" onClick={testMic} disabled={!signedIn}>Test microphone</button>
          <button type="button" onClick={testVoice} disabled={!signedIn}>Test voice output</button>
          <button type="button" onClick={toggleDebug}>{voiceDebug ? "Disable voice debug" : "Enable voice debug"}</button>
        </div>
      </section>

      <section>
        <h2>Selected model</h2>
        <p className="badge">{model}</p>
      </section>

      <div className="links">
        <button type="button" onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/dashboard` })}>
          Open dashboard
        </button>
        <button type="button" onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/dashboard/candidate` })}>
          Open browser copilot
        </button>
        <button type="button" onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/dashboard/settings/voice` })}>
          Open AI settings
        </button>
        {signedIn ? <button type="button" onClick={signOut}>Sign out / clear token</button> : null}
      </div>
      {message ? <p className="message">{message}</p> : null}
    </main>
  );
}

const styles = document.createElement("style");
styles.textContent = `
  body { margin: 0; width: 350px; background: #fbfdfb; color: #142018; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  main { padding: 14px; display: grid; gap: 14px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  h1 { margin: 0; font-size: 16px; }
  h2 { margin: 0 0 8px; font-size: 13px; }
  p { margin: 0; color: #58665e; font-size: 12px; }
  button { border: 1px solid #d8e0da; border-radius: 8px; background: white; color: #142018; padding: 9px 10px; font: inherit; cursor: pointer; }
  button:disabled { opacity: .6; cursor: not-allowed; }
  .primary { width: 100%; background: #246b45; color: white; border-color: #246b45; font-weight: 700; }
  section { border: 1px solid #d8e0da; border-radius: 8px; background: white; padding: 12px; }
  select { width: 100%; border: 1px solid #b6f08c; border-radius: 999px; background: #fff; color: #2d6a2d; padding: 9px 12px; font: inherit; font-weight: 700; }
  .badge { display: inline-flex; width: fit-content; border-radius: 6px; background: #e8f4ec; color: #1b5f36; padding: 5px 8px; font-weight: 700; }
  .links { display: grid; gap: 8px; }
  .message { border: 1px solid #d8e0da; border-radius: 8px; background: white; padding: 8px; }
  .mono { overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
`;
document.head.appendChild(styles);

createRoot(document.getElementById("root")!).render(<Popup />);
