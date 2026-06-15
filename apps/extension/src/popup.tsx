import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { VoiceMode } from "@joblens/shared";
import { getModelLabel } from "@joblens/shared";
import { API_BASE_URL } from "./config";
import { apiFetch, getExtensionToken, loadStartupState } from "./apiClient";

const modes: Array<{ value: VoiceMode; label: string }> = [
  { value: "auto", label: "Auto Select" },
  { value: "web_speech", label: "Fast & Free Voice" },
  { value: "livekit_gemini", label: "Natural Call Voice" }
];

function Popup() {
  const [signedIn, setSignedIn] = useState(false);
  const [mode, setMode] = useState<VoiceMode>("auto");
  const [model, setModel] = useState("Platform Default");
  const [message, setMessage] = useState("");

  async function load() {
    const token = await getExtensionToken();
    setSignedIn(Boolean(token));
    const state = await loadStartupState().catch(() => null);
    if (state?.preferences?.defaultVoiceMode) setMode(state.preferences.defaultVoiceMode);
    if (state?.credentials?.brainModel) setModel(getModelLabel(state.credentials.brainModel));
  }

  useEffect(() => {
    void load();
  }, []);

  async function changeMode(next: VoiceMode) {
    setMode(next);
    try {
      await apiFetch("/api/voice/preferences", {
        method: "PATCH",
        body: JSON.stringify({ defaultVoiceMode: next })
      });
      setMessage("Voice mode updated.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update mode.");
    }
  }

  function openExtensionLogin() {
    const extensionId = encodeURIComponent(chrome.runtime.id);
    chrome.tabs.create({ url: `${API_BASE_URL}/login?from=extension&extensionId=${extensionId}` });
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
          <h1>JobLens Voice</h1>
          <p>{signedIn ? "Signed in" : "Not signed in"}</p>
        </div>
        <button type="button" onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/dashboard` })}>Open</button>
      </header>

      {!signedIn ? (
        <button className="primary" type="button" onClick={openExtensionLogin}>
          Sign in
        </button>
      ) : null}

      <section>
        <h2>Voice mode</h2>
        <div className="choices">
          {modes.map((item) => (
            <label key={item.value}>
              <input type="radio" checked={mode === item.value} onChange={() => changeMode(item.value)} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2>Brain model</h2>
        <p className="badge">{model}</p>
      </section>

      <div className="links">
        <button type="button" onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/dashboard/settings/voice` })}>
          Manage AI models & API keys
        </button>
        <button type="button" onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/dashboard` })}>
          Open dashboard
        </button>
      </div>
      {message ? <p className="message">{message}</p> : null}
    </main>
  );
}

const styles = document.createElement("style");
styles.textContent = `
  body { margin: 0; width: 340px; background: #fbfdfb; color: #142018; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  main { padding: 14px; display: grid; gap: 14px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  h1 { margin: 0; font-size: 16px; }
  h2 { margin: 0 0 8px; font-size: 13px; }
  p { margin: 0; color: #58665e; font-size: 12px; }
  button { border: 1px solid #d8e0da; border-radius: 8px; background: white; color: #142018; padding: 9px 10px; font: inherit; cursor: pointer; }
  .primary { width: 100%; background: #4c9a68; color: white; border-color: #4c9a68; font-weight: 700; }
  section { border: 1px solid #d8e0da; border-radius: 8px; background: white; padding: 12px; }
  .choices { display: grid; gap: 8px; }
  label { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .badge { display: inline-flex; width: fit-content; border-radius: 6px; background: #e8f4ec; color: #1b5f36; padding: 5px 8px; font-weight: 700; }
  .links { display: grid; gap: 8px; }
  .message { border: 1px solid #d8e0da; border-radius: 8px; background: white; padding: 8px; }
`;
document.head.appendChild(styles);

createRoot(document.getElementById("root")!).render(<Popup />);
