import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getModelLabel } from "@joblens/shared";
import { API_BASE_URL } from "./config";
import { getBackendStatus, getExtensionToken, getLinkedUserEmail, loadStartupState } from "./apiClient";
import type { ExtensionMessage } from "./types/messages";
import { speakTestVoice, VOICE_OPTIONS, type VoiceOption } from "./voice/webSpeechController";

type PopupTheme = "light" | "dark";

function Popup() {
  const [signedIn, setSignedIn] = useState(false);
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const [model, setModel] = useState("Platform Default (TypeGPT)");
  const [voiceId, setVoiceId] = useState<VoiceOption["id"]>("voice_a");
  const [voiceDebug, setVoiceDebug] = useState(false);
  const [theme, setTheme] = useState<PopupTheme>("light");
  const [message, setMessage] = useState("");
  const [syncing, setSyncing] = useState(false);
  const extensionId = chrome.runtime.id;

  async function load() {
    const [token, email, stored] = await Promise.all([
      getExtensionToken(),
      getLinkedUserEmail(),
      chrome.storage.local.get(["voiceId", "voiceDebug", "popupTheme"])
    ]);
    setLinkedEmail(email);
    if (stored.popupTheme === "dark" || stored.popupTheme === "light") setTheme(stored.popupTheme);
    if (typeof stored.voiceId === "string" && VOICE_OPTIONS.some((option) => option.id === stored.voiceId)) {
      setVoiceId(stored.voiceId as VoiceOption["id"]);
    }
    setVoiceDebug(stored.voiceDebug === true);
    if (!token) {
      setSignedIn(false);
      setModel("Platform Default (TypeGPT)");
      return;
    }
    try {
      const status = await getBackendStatus();
      setSignedIn(true);
      if (status.email) setLinkedEmail(status.email);
    } catch (error) {
      setSignedIn(false);
      setModel("Platform Default (TypeGPT)");
      setMessage(error instanceof Error ? error.message : "Could not verify the backend connection.");
      return;
    }
    const state = await loadStartupState().catch(() => null);
    if (state?.credentials?.brainProvider === "platform") {
      setModel("Platform Default (TypeGPT)");
    } else if (state?.credentials?.brainModel) {
      setModel(getModelLabel(state.credentials.brainModel));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function refresh() {
    setSyncing(true);
    setMessage("");
    const response = await chrome.runtime.sendMessage({ type: "SYNC_STARTUP_STATE" } satisfies ExtensionMessage).catch((error) => ({
      ok: false,
      error: error instanceof Error ? error.message : "Could not contact the extension background worker."
    }));
    await load();
    setMessage(response?.ok ? "Backend connection verified." : response?.error ?? "Could not verify backend connection.");
    setSyncing(false);
  }

  async function signOut() {
    await chrome.runtime.sendMessage({ type: "CLEAR_EXTENSION_TOKEN" } satisfies ExtensionMessage).catch(() => null);
    setSignedIn(false);
    setMessage("Signed out of the extension. The linked dashboard account is remembered.");
  }

  async function resetAccount() {
    await chrome.runtime.sendMessage({ type: "RESET_EXTENSION_ACCOUNT" } satisfies ExtensionMessage).catch(() => null);
    setSignedIn(false);
    setLinkedEmail(null);
    setMessage("Linked account reset. Connect again using your dashboard Google account.");
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

  async function toggleTheme() {
    const next: PopupTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await chrome.storage.local.set({ popupTheme: next });
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

  function openExtensionConnect() {
    chrome.tabs.create({ url: `${API_BASE_URL}/extension/connect?extensionId=${encodeURIComponent(extensionId)}` });
  }

  useEffect(() => {
    function onStorageChanged(changes: Record<string, chrome.storage.StorageChange>, areaName: string) {
      if (areaName !== "local") return;
      if (changes.extensionToken || changes.linkedUserEmail) void load();
    }

    chrome.storage.onChanged.addListener(onStorageChanged);
    return () => chrome.storage.onChanged.removeListener(onStorageChanged);
  }, []);

  return (
    <main>
      <header>
        <div>
          <h1>JobLens AI Browser Copilot</h1>
          <p>{signedIn ? "Ready on webpages" : "Connect your dashboard account"}</p>
        </div>
        <button type="button" className="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>

      <section className="status">
        <div>
          <span className={signedIn ? "dot ok" : "dot"} />
          <strong>{signedIn ? "Backend connected" : "Not connected"}</strong>
        </div>
        <p>{linkedEmail ? `Linked account: ${linkedEmail}` : "Use the same Google account you use in the JobLens dashboard."}</p>
      </section>

      {!signedIn ? (
        <button className="primary" type="button" onClick={openExtensionConnect}>
          Sign in with dashboard Google account
        </button>
      ) : null}

      <section>
        <h2>Voice mode</h2>
        <p className="badge">Browser Web Voice</p>
        <p style={{ marginTop: 8 }}>Open any webpage, click the floating JobLens button, and ask by voice.</p>
      </section>

      <section>
        <h2>Voice style</h2>
        <select value={voiceId} onChange={(event) => changeVoiceStyle(event.target.value as VoiceOption["id"])} disabled={!signedIn}>
          {VOICE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </section>

      <section>
        <h2>Checks</h2>
        <div className="links">
          <button type="button" onClick={refresh} disabled={syncing}>{syncing ? "Syncing..." : "Sync dashboard settings"}</button>
          <button type="button" onClick={testMic} disabled={!signedIn}>Test microphone</button>
          <button type="button" onClick={testVoice} disabled={!signedIn}>Test voice output</button>
          <button type="button" onClick={toggleDebug}>{voiceDebug ? "Disable debug overlay" : "Enable debug overlay"}</button>
        </div>
      </section>

      <section>
        <h2>AI brain</h2>
        <p className="badge">{model}</p>
      </section>

      <div className="links">
        <button type="button" onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/dashboard/candidate` })}>
          Open dashboard
        </button>
        <button type="button" onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/dashboard/settings/voice` })}>
          Open AI settings
        </button>
        {signedIn ? <button type="button" onClick={signOut}>Sign out extension</button> : null}
        {linkedEmail ? <button type="button" className="danger" onClick={resetAccount}>Reset linked account</button> : null}
      </div>

      {message ? <p className="message">{message}</p> : null}
    </main>
  );
}

const styles = document.createElement("style");
styles.textContent = `
  :root {
    --bg: #fbfdfb;
    --panel: #ffffff;
    --text: #142018;
    --muted: #58665e;
    --border: #d8e0da;
    --primary: #246b45;
    --primary-soft: #e8f4ec;
    --danger: #a63f3f;
  }
  :root[data-theme="dark"] {
    --bg: #0d1510;
    --panel: #131f17;
    --text: #f0f7f1;
    --muted: #a7b7ad;
    --border: #26382c;
    --primary: #85d894;
    --primary-soft: #1d3524;
    --danger: #ff9f9f;
  }
  body { margin: 0; width: 360px; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  main { padding: 14px; display: grid; gap: 14px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  h1 { margin: 0; font-size: 16px; line-height: 1.2; }
  h2 { margin: 0 0 8px; font-size: 13px; }
  p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.45; }
  strong { font-size: 13px; }
  button { border: 1px solid var(--border); border-radius: 8px; background: var(--panel); color: var(--text); padding: 9px 10px; font: inherit; cursor: pointer; }
  button:disabled { opacity: .55; cursor: not-allowed; }
  .primary { width: 100%; background: var(--primary); color: var(--bg); border-color: var(--primary); font-weight: 800; }
  .icon { padding: 7px 9px; font-size: 12px; }
  .danger { color: var(--danger); }
  section { border: 1px solid var(--border); border-radius: 8px; background: var(--panel); padding: 12px; }
  .status div { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
  .dot { width: 9px; height: 9px; border-radius: 999px; background: #c7a447; box-shadow: 0 0 0 3px color-mix(in srgb, #c7a447 18%, transparent); }
  .dot.ok { background: #35a35c; box-shadow: 0 0 0 3px color-mix(in srgb, #35a35c 18%, transparent); }
  select { width: 100%; border: 1px solid var(--border); border-radius: 999px; background: var(--panel); color: var(--text); padding: 9px 12px; font: inherit; font-weight: 700; }
  .badge { display: inline-flex; width: fit-content; border-radius: 6px; background: var(--primary-soft); color: var(--primary); padding: 5px 8px; font-weight: 800; }
  .links { display: grid; gap: 8px; }
  .message { border: 1px solid var(--border); border-radius: 8px; background: var(--panel); padding: 8px; }
`;
document.head.appendChild(styles);

createRoot(document.getElementById("root")!).render(<Popup />);
