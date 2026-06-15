const STYLES = `
  .jl-overlay {
    position: fixed;
    bottom: 104px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483646;
    max-width: 480px;
    width: calc(100vw - 48px);
    text-align: center;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }
  .jl-overlay[data-hidden="true"] { opacity: 0; }
  .jl-overlay-text {
    display: inline-block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 17px;
    font-weight: 500;
    line-height: 1.5;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.55), 0 0 20px rgba(0,0,0,0.35);
    padding: 0 12px;
  }
  .jl-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.9);
    margin-bottom: 8px;
  }
  .jl-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #b6f08c;
  }
  [data-state="thinking"] .jl-status-dot { background: #f59e0b; animation: jl-dot-blink 0.8s infinite; }
  [data-state="speaking"] .jl-status-dot { background: #3b82f6; }
  [data-state="error"] .jl-status-dot { background: #ef4444; }
  @keyframes jl-dot-blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
`;

const STATE_LABELS: Record<string, string> = {
  preparing: "Analyzing page...",
  listening: "Listening",
  thinking: "Thinking...",
  speaking: "Speaking",
  error: "Error",
  ended: "",
  idle: ""
};

export function TranscriptOverlay({ state, userTranscript }: { state: string; userTranscript: string }) {
  const hidden = state === "idle" || state === "ended" || state === "speaking";
  const label = STATE_LABELS[state] ?? "";

  return (
    <>
      <style>{STYLES}</style>
      <div className="jl-overlay" data-hidden={hidden ? "true" : "false"} data-state={state}>
        {label ? (
          <div className="jl-status-pill">
            <span className="jl-status-dot" aria-hidden="true" />
            {label}
          </div>
        ) : null}
        {userTranscript && state === "listening" ? <p className="jl-overlay-text">{userTranscript}</p> : null}
      </div>
    </>
  );
}
