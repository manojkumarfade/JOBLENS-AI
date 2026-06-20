"use client";

import { useEffect, useMemo, useState } from "react";
import type { CredentialStatus, ModelProvider, VoicePreferences } from "@joblens/shared";
import { getModelLabel, modelCatalog } from "@joblens/shared";
import { ApiKeyField } from "@/components/voice/ApiKeyField";
import { ModelPicker } from "@/components/voice/ModelPicker";
import { ModelProviderSelector } from "@/components/voice/ModelProviderSelector";
import { WebSpeechTester } from "@/components/voice/WebSpeechTester";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { authFetch } from "@/lib/auth/clientFetch";

export function VoiceSettingsForm() {
  const [preferences, setPreferences] = useState<VoicePreferences | null>(null);
  const [credentials, setCredentials] = useState<CredentialStatus | null>(null);
  const [catalog, setCatalog] = useState(modelCatalog);
  const [typegptApiKey, setTypegptApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [testingKey, setTestingKey] = useState(false);

  async function load() {
    const [prefsRes, credsRes, catalogRes] = await Promise.all([
      authFetch("/api/voice/preferences"),
      authFetch("/api/settings/model-credentials"),
      authFetch("/api/models/catalog")
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
  const currentPreferences = preferences;
  const currentCredentials = credentials;

  async function save() {
    setMessage("Saving settings...");
    const [prefsRes, credsRes] = await Promise.all([
      authFetch("/api/voice/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentPreferences, defaultVoiceMode: "web_speech" })
      }),
      authFetch("/api/settings/model-credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brainProvider: currentCredentials.brainProvider,
          brainModel: currentCredentials.brainModel,
          ...(typegptApiKey !== "" ? { typegptApiKey } : {})
        })
      })
    ]);
    const credsBody = await credsRes.json().catch(() => null);
    if (prefsRes.ok && credsRes.ok) {
      setCredentials(credsBody.credentials);
      setTypegptApiKey("");
      setMessage("Settings saved.");
      await load();
    } else {
      setMessage(credsBody?.error?.message ?? "Could not save settings.");
    }
  }

  async function testKey() {
    if (!typegptApiKey) {
      setMessage("Enter a new key first.");
      return;
    }
    setTestingKey(true);
    setMessage("Testing TypeGPT key...");
    const res = await authFetch("/api/settings/model-credentials/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "typegpt", apiKey: typegptApiKey })
    });
    const body = await res.json().catch(() => null);
    setMessage(
      res.ok
        ? `API key test succeeded in ${body.latencyMs ?? "?"} ms.`
        : body?.error?.message ?? "API key test failed."
    );
    setTestingKey(false);
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
        <span className="font-medium">Active AI brain:</span>{" "}
        {currentCredentials.brainProvider === "platform" ? "Platform Default" : getModelLabel(currentCredentials.brainModel)}
        {currentCredentials.typegptKeyConfigured ? " (your TypeGPT key available)" : ""}
      </div>

      <Card>
        <CardHeader><CardTitle>Brain Model</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ModelProviderSelector
            value={currentCredentials.brainProvider}
            onChange={(brainProvider: ModelProvider) =>
              setCredentials({
                ...currentCredentials,
                brainProvider,
                brainModel: brainProvider === "typegpt" ? "openai/gpt-oss-20b" : currentCredentials.brainModel
              })
            }
          />
          {currentCredentials.brainProvider !== "platform" ? (
            <ModelPicker
              label="Model"
              value={currentCredentials.brainModel}
              models={providerModels}
              onChange={(brainModel) => setCredentials({ ...currentCredentials, brainModel })}
            />
          ) : (
            <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">
              Platform Default uses the server-configured TypeGPT fallback model.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI & API Key</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <ApiKeyField
            label="TypeGPT API Key"
            configured={currentCredentials.typegptKeyConfigured}
            value={typegptApiKey}
            onChange={setTypegptApiKey}
            onRemove={() => setTypegptApiKey(" ")}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={testKey} disabled={testingKey}>{testingKey ? "Testing key..." : "Test TypeGPT key"}</Button>
            <Button type="button" variant="outline" onClick={testMic}>Test microphone</Button>
            <WebSpeechTester rate={currentPreferences.speechRate} pitch={currentPreferences.speechPitch} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Browser speech behavior</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={currentPreferences.languageCode} onChange={(event) => setPreferences({ ...currentPreferences, languageCode: event.target.value })}>
              <option value="en-US">English (US)</option>
              <option value="en-IN">English (India)</option>
              <option value="en-GB">English (UK)</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred browser voice</Label>
            <Input value={currentPreferences.preferredBrowserVoice ?? ""} onChange={(event) => setPreferences({ ...currentPreferences, preferredBrowserVoice: event.target.value || null })} />
          </div>
          <div className="space-y-2">
            <Label>Speech rate</Label>
            <Input type="number" min="0.5" max="2" step="0.1" value={currentPreferences.speechRate} onChange={(event) => setPreferences({ ...currentPreferences, speechRate: Number(event.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Speech pitch</Label>
            <Input type="number" min="0" max="2" step="0.1" value={currentPreferences.speechPitch} onChange={(event) => setPreferences({ ...currentPreferences, speechPitch: Number(event.target.value) })} />
          </div>
          <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground md:col-span-2">
            Browser speech uses Chrome or Edge Web Speech APIs for candidate Browser Copilot workflows. Temporary live transcripts are not stored by default.
          </p>
        </CardContent>
      </Card>

      {message ? <p className="rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
      <Button onClick={save}>Save settings</Button>
    </div>
  );
}
