"use client";

import type { VoiceMode } from "@joblens/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const modes: Array<{ value: VoiceMode; title: string; description: string }> = [
  { value: "auto", title: "Auto Select", description: "Uses Natural Call Voice when available, otherwise Fast & Free Voice." },
  { value: "web_speech", title: "Fast & Free Voice", description: "Uses your browser voice engine. Free and works everywhere." },
  { value: "livekit_gemini", title: "Natural Call Voice", description: "Real-time call-like voice using LiveKit and Gemini Live." }
];

export function VoiceModeSelector({
  value,
  onChange,
  liveKitAvailable
}: {
  value: VoiceMode;
  onChange: (value: VoiceMode) => void;
  liveKitAvailable: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {modes.map((mode) => {
        const active = value === mode.value;
        const status =
          mode.value === "livekit_gemini" && !liveKitAvailable
            ? "Requires API key"
            : mode.value === "auto"
              ? "Recommended"
              : "Available";
        return (
          <button key={mode.value} type="button" className="text-left" onClick={() => onChange(mode.value)}>
            <Card className={active ? "ring-2 ring-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{mode.title}</CardTitle>
                  <Badge variant={status === "Available" ? "secondary" : "outline"}>{status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{mode.description}</CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
