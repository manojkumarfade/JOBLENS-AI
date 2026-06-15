import type { VoiceMode } from "@joblens/shared";
import type { VoiceState } from "../types/messages";
import { ErrorBanner } from "./ErrorBanner";
import { ModeBadge } from "./ModeBadge";
import { ModelBadge } from "./ModelBadge";

const textByState: Record<VoiceState, string> = {
  idle: "Ask JobLens about this page",
  preparing_context: "Reading this page...",
  connecting: "Connecting voice agent...",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
  error: "Voice mode unavailable",
  ended: "Session ended"
};

export function VoicePanel({
  state,
  mode,
  modelLabel,
  message,
  transcripts,
  onEnd,
  onFallback
}: {
  state: VoiceState;
  mode: VoiceMode;
  modelLabel?: string | null;
  message?: string;
  transcripts: Array<{ role: string; text: string }>;
  onEnd: () => void;
  onFallback?: () => void;
}) {
  return (
    <section className="jl-panel">
      <div className="jl-panel-header">
        <div>
          <strong>{textByState[state]}</strong>
          <div className="jl-panel-badges">
            <ModeBadge mode={mode} />
            <ModelBadge label={modelLabel} />
          </div>
        </div>
        <button type="button" className="jl-icon-button" onClick={onEnd} title="End session">
          ×
        </button>
      </div>
      <div className="jl-wave" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <ErrorBanner message={state === "error" ? message : undefined} onFallback={onFallback} />
      <div className="jl-transcripts">
        {transcripts.length === 0 ? (
          <p>Click and speak, or use the popup to change voice mode.</p>
        ) : (
          transcripts.slice(-4).map((turn, index) => (
            <p key={`${turn.role}-${index}`} className={`jl-turn jl-turn-${turn.role}`}>
              <span>{turn.role}</span> {turn.text}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
