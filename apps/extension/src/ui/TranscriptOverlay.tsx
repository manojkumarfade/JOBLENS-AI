import { useEffect, useMemo, useState } from "react";
import type { ConversationState } from "../voice/webSpeechController";

const STYLES = `
  .jl-overlay {
    position: fixed;
    left: 50%;
    bottom: 108px;
    z-index: 2147483646;
    width: min(680px, calc(100vw - 48px));
    transform: translateX(-50%) translateY(0);
    text-align: center;
    pointer-events: none;
    opacity: 1;
    transition: opacity 450ms ease, transform 450ms ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .jl-overlay[data-hidden="true"] {
    opacity: 0;
    transform: translateX(-50%) translateY(12px);
  }
  .jl-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 7px;
    color: rgba(255,255,255,0.92);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 4px rgba(0,0,0,0.75), 0 0 18px rgba(0,0,0,0.45);
  }
  .jl-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #b6f08c;
    box-shadow: 0 0 18px rgba(182,240,140,0.9);
  }
  [data-state="hearing_audio"] .jl-dot,
  [data-state="transcribing"] .jl-dot { animation: jl-pulse 650ms ease-in-out infinite; }
  [data-state="thinking"] .jl-dot { background: #f59e0b; box-shadow: 0 0 18px rgba(245,158,11,0.85); animation: jl-pulse 850ms ease-in-out infinite; }
  [data-state="speaking"] .jl-dot { background: #60a5fa; box-shadow: 0 0 18px rgba(96,165,250,0.85); }
  [data-state="error"] .jl-dot { background: #f87171; box-shadow: 0 0 18px rgba(248,113,113,0.85); }
  .jl-caption {
    margin: 0 auto;
    color: #fff;
    font-size: clamp(18px, 2.6vw, 30px);
    font-weight: 750;
    line-height: 1.28;
    text-wrap: balance;
    text-shadow: 0 2px 5px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.5);
    animation: jl-rise 420ms ease both;
  }
  .jl-caption[data-muted="true"] {
    color: rgba(255,255,255,0.7);
    font-weight: 650;
  }
  .jl-debug {
    margin-top: 7px;
    color: rgba(255,255,255,0.58);
    font-size: 11px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  }
  @keyframes jl-rise {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes jl-pulse {
    0%, 100% { transform: scale(1); opacity: 0.95; }
    50% { transform: scale(1.55); opacity: 0.4; }
  }
`;

const STATE_LABELS: Record<ConversationState, string> = {
  idle: "",
  preparing: "Preparing...",
  mic_ready: "Mic ready",
  listening: "Listening...",
  hearing_audio: "Hearing audio...",
  transcribing: "I heard...",
  thinking: "Thinking...",
  speaking: "Speaking...",
  error: "Needs attention",
  ended: ""
};

export function TranscriptOverlay({
  state,
  interimTranscript,
  finalTranscript,
  assistantSubtitle,
  errorMessage,
  debugMessage
}: {
  state: ConversationState;
  interimTranscript: string;
  finalTranscript: string;
  assistantSubtitle?: string;
  errorMessage?: string;
  debugMessage?: string;
}) {
  const [visible, setVisible] = useState(false);
  const text = useMemo(() => {
    if (state === "error" && errorMessage) return errorMessage;
    if (state === "thinking") return "Thinking...";
    if (state === "speaking" && assistantSubtitle) return assistantSubtitle;
    return interimTranscript || finalTranscript;
  }, [assistantSubtitle, errorMessage, finalTranscript, interimTranscript, state]);

  useEffect(() => {
    if (!text && state !== "listening" && state !== "mic_ready" && state !== "hearing_audio") {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timeout = state === "error" ? 4200 : finalTranscript && !interimTranscript ? 2400 : null;
    if (!timeout) return;
    const timer = window.setTimeout(() => setVisible(false), timeout);
    return () => window.clearTimeout(timer);
  }, [finalTranscript, interimTranscript, state, text]);

  const label = STATE_LABELS[state];
  const showStatus = visible && Boolean(label);
  const muted = !interimTranscript && Boolean(finalTranscript);

  return (
    <>
      <style>{STYLES}</style>
      <div className="jl-overlay" data-hidden={visible ? "false" : "true"} data-state={state}>
        {showStatus ? (
          <div className="jl-status">
            <span className="jl-dot" aria-hidden="true" />
            {label}
          </div>
        ) : null}
        {text ? <p className="jl-caption" data-muted={muted ? "true" : "false"}>{lastWords(text, 20)}</p> : null}
        {debugMessage ? <p className="jl-debug">{debugMessage}</p> : null}
      </div>
    </>
  );
}

function lastWords(text: string, count: number) {
  return text.split(/\s+/).filter(Boolean).slice(-count).join(" ");
}
