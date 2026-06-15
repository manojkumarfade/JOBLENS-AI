"use client";

import { useEffect, useMemo, useState } from "react";
import type { CredentialStatus, ModelProvider, VoicePreferences } from "@joblens/shared";
import { getModelLabel, modelCatalog, voiceModels } from "@joblens/shared";
import { ApiKeyField } from "@/components/voice/ApiKeyField";
import { LiveKitConnectionTester } from "@/components/voice/LiveKitConnectionTester";
import { LiveKitCredentialsForm } from "@/components/voice/LiveKitCredentialsForm";
import { ModelPicker } from "@/components/voice/ModelPicker";
import { ModelProviderSelector } from "@/components/voice/ModelProviderSelector";
import { VoiceModeSelector } from "@/components/voice/VoiceModeSelector";
import { WebSpeechTester } from "@/components/voice/WebSpeechTester";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function VoiceSettingsForm() {
  const [preferences, setPreferences] = useState<VoicePreferences | null>(null);
  const [credentials, setCredentials] = useState<CredentialStatus | null>(null);
  const [catalog, setCatalog] = useState(modelCatalog);
  const [keys, setKeys] = useState({ typegptApiKey: "", googleApiKey: "", liveKitApiKey: "", liveKitApiSecret: "" });
  const [message, setMessage] = useState("");

  async function load() {
    const [prefsRes, credsRes, catalogRes] = await Promise.all([
      fetch("/api/voice/preferences"),
      fetch("/api/settings/model-credentials"),
      fetch("/api/models/catalog")
    ]);
    if (prefsRes.ok) setPreferences(await prefsRes.json());
    if (credsRes.ok) setCredentials(await credsRes.json());
    if (catalogRes.ok) setCatalog(await catalogRes.json());
  }

  useEffect(() => {
    void load();
  }, []);

  const providerModels = useMemo(() => {
    if (!credentials || credentials.brainProvider === "platform") return [];
    return catalog.brainModels.filter((model) => model.provider === credentials.brainProvider);
  }, [catalog.brainModels, credentials]);

  if (!preferences || !credentials) return <Skeleton className="h-96" />;

  async function save() {
    setMessage("Saving settings...");
    const [prefsRes, credsRes] = await Promise.all([
      fetch("/api/voice/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences)
      }),
      fetch("/api/settings/model-credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...credentials,
          ...Object.fromEntries(Object.entries(keys).filter(([, value]) => value !== ""))
        })
      })
    ]);
    const credsBody = await credsRes.json().catch(() => null);
    if (prefsRes.ok && credsRes.ok) {
      setCredentials(credsBody.credentials);
      setKeys({ typegptApiKey: "", googleApiKey: "", liveKitApiKey: "", liveKitApiSecret: "" });
      setMessage("Settings saved.");
      await load();
    } else {
      setMessage(credsBody?.error?.message ?? "Could not save settings.");
    }
  }

  async function testKey(provider: "typegpt" | "gemini") {
    const apiKey = provider === "typegpt" ? keys.typegptApiKey : keys.googleApiKey;
    if (!apiKey) {
      setMessage("Enter a new key first.");
      return;
    }
    const res = await fetch("/api/settings/model-credentials/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey })
    });
    const body = await res.json();
    setMessage(res.ok ? "API key test succeeded." : body.error?.message ?? "API key test failed.");
  }

  function testMic() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        setMessage("Microphone is available.");
      })
      .catch(() => setMessage("Microphone permission was denied or unavailable."));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4 text-sm">
        <span className="font-medium">Active:</span> {preferences.liveKitConfigAvailable && preferences.defaultVoiceMode !== "web_speech" ? "Natural Call Voice" : "Fast & Free Voice"} · Voice model: {getModelLabel(credentials.voiceModel)} · Brain: {credentials.brainProvider === "platform" ? "Platform Default" : getModelLabel(credentials.brainModel)}{credentials.typegptKeyConfigured || credentials.googleKeyConfigured ? " (your key available)" : ""}
      </div>

      <Card>
        <CardHeader><CardTitle>Voice Mode</CardTitle></CardHeader>
        <CardContent>
          <VoiceModeSelector value={preferences.defaultVoiceMode} liveKitAvailable={Boolean(preferences.liveKitConfigAvailable)} onChange={(defaultVoiceMode) => setPreferences({ ...preferences, defaultVoiceMode })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Brain Model</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ModelProviderSelector value={credentials.brainProvider} onChange={(brainProvider: ModelProvider) => setCredentials({ ...credentials, brainProvider, brainModel: brainProvider === "gemini" ? "gemini-2.5-flash" : brainProvider === "typegpt" ? "openai/gpt-oss-20b" : credentials.brainModel })} />
          {credentials.brainProvider !== "platform" ? (
            <ModelPicker label="Model" value={credentials.brainModel} models={providerModels} onChange={(brainModel) => setCredentials({ ...credentials, brainModel })} />
          ) : (
            <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">Platform Default uses the server-configured fallback model.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI & API Keys</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <ApiKeyField label="TypeGPT API Key" configured={credentials.typegptKeyConfigured} value={keys.typegptApiKey} onChange={(typegptApiKey) => setKeys({ ...keys, typegptApiKey })} onRemove={() => setKeys({ ...keys, typegptApiKey: " " })} />
          <Button type="button" variant="outline" onClick={() => testKey("typegpt")}>Test TypeGPT key</Button>
          <ApiKeyField label="Gemini (Google) API Key" configured={credentials.googleKeyConfigured} value={keys.googleApiKey} onChange={(googleApiKey) => setKeys({ ...keys, googleApiKey })} onRemove={() => setKeys({ ...keys, googleApiKey: " " })} />
          <Button type="button" variant="outline" onClick={() => testKey("gemini")}>Test Gemini key</Button>
          <ModelPicker label="Voice Model" value={credentials.voiceModel} models={voiceModels} disabled={!credentials.googleKeyConfigured && !preferences.liveKitConfigAvailable} onChange={(voiceModel) => setCredentials({ ...credentials, voiceModel })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={credentials.useOwnLiveKit} onChange={(event) => setCredentials({ ...credentials, useOwnLiveKit: event.target.checked })} />
            Use my own LiveKit project
          </label>
          {credentials.useOwnLiveKit ? (
            <LiveKitCredentialsForm
              liveKitUrl={credentials.liveKitUrl ?? ""}
              liveKitApiKey={keys.liveKitApiKey}
              liveKitApiSecret={keys.liveKitApiSecret}
              onChange={(patch) => {
                if (patch.liveKitUrl !== undefined) setCredentials({ ...credentials, liveKitUrl: patch.liveKitUrl });
                setKeys((current) => ({ ...current, ...patch }));
              }}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={testMic}>Test microphone</Button>
            <WebSpeechTester rate={preferences.speechRate} pitch={preferences.speechPitch} />
            <LiveKitConnectionTester onTest={() => setMessage(preferences.liveKitConfigAvailable ? "LiveKit configuration is available server-side." : "Natural Call Voice needs Gemini and LiveKit credentials.")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Fallback & Behavior</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={preferences.autoFallbackEnabled} onChange={(event) => setPreferences({ ...preferences, autoFallbackEnabled: event.target.checked })} />
            Auto-fallback to Fast & Free if Natural Call fails
          </label>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={preferences.languageCode} onChange={(event) => setPreferences({ ...preferences, languageCode: event.target.value })}>
              <option value="en-US">English (US)</option>
              <option value="en-IN">English (India)</option>
              <option value="en-GB">English (UK)</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred browser voice</Label>
            <Input value={preferences.preferredBrowserVoice ?? ""} onChange={(event) => setPreferences({ ...preferences, preferredBrowserVoice: event.target.value || null })} />
          </div>
          <div className="space-y-2">
            <Label>Speech rate</Label>
            <Input type="number" min="0.5" max="2" step="0.1" value={preferences.speechRate} onChange={(event) => setPreferences({ ...preferences, speechRate: Number(event.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Speech pitch</Label>
            <Input type="number" min="0" max="2" step="0.1" value={preferences.speechPitch} onChange={(event) => setPreferences({ ...preferences, speechPitch: Number(event.target.value) })} />
          </div>
          <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground md:col-span-2">
            Auto Select tries Natural Call Voice first. If it is unavailable because of plan, missing API key, microphone permission, or a network issue, JobLens switches to Fast & Free Voice. If neither works, you can still type your questions.
          </p>
        </CardContent>
      </Card>

      {message ? <p className="rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
      <Button onClick={save}>Save settings</Button>
    </div>
  );
}
