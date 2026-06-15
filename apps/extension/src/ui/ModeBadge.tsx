import type { VoiceMode } from "@joblens/shared";

const labels: Record<VoiceMode, string> = {
  auto: "Auto",
  web_speech: "Fast & Free",
  livekit_gemini: "Natural Call"
};

export function ModeBadge({ mode }: { mode: VoiceMode }) {
  return <span className="jl-badge">{labels[mode]}</span>;
}
