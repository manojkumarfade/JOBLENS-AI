"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LiveKitCredentialsForm({
  liveKitUrl,
  liveKitApiKey,
  liveKitApiSecret,
  onChange
}: {
  liveKitUrl: string;
  liveKitApiKey: string;
  liveKitApiSecret: string;
  onChange: (patch: Partial<{ liveKitUrl: string; liveKitApiKey: string; liveKitApiSecret: string }>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label>LiveKit URL</Label>
        <Input value={liveKitUrl} onChange={(event) => onChange({ liveKitUrl: event.target.value })} placeholder="wss://project.livekit.cloud" />
      </div>
      <div className="space-y-2">
        <Label>LiveKit API key</Label>
        <Input type="password" value={liveKitApiKey} onChange={(event) => onChange({ liveKitApiKey: event.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>LiveKit API secret</Label>
        <Input type="password" value={liveKitApiSecret} onChange={(event) => onChange({ liveKitApiSecret: event.target.value })} />
      </div>
    </div>
  );
}
