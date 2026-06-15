import { Mic, PhoneOff } from "lucide-react";
import type { ConversationState } from "../voice/webSpeechController";

const STYLES = `
  .jl-fab-wrap {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .jl-call-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fee2e2;
    border: 1.5px solid #f87171;
    color: #b91c1c;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0,0,0,0.14);
    transition: transform 0.15s ease, opacity 0.2s ease;
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
  }
  .jl-fab-wrap[data-active="true"] .jl-call-btn {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .jl-call-btn:hover { transform: scale(1.08); }
  .jl-fab {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
    transition: transform 0.15s ease;
  }
  .jl-fab:hover { transform: scale(1.06); }
  .jl-fab:active { transform: scale(0.97); }
  .jl-fab-dot {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #b6f08c;
    border: 2px solid #fff;
  }
  .jl-fab[data-state="listening"] .jl-fab-dot { background: #5ccb33; }
  .jl-fab[data-state="thinking"] .jl-fab-dot { background: #f59e0b; }
  .jl-fab[data-state="speaking"] .jl-fab-dot { background: #3b82f6; }
  .jl-fab[data-state="error"] .jl-fab-dot { background: #ef4444; }
  .jl-fab-icon { color: #2d6a2d; }
  .jl-fab[data-state="error"] .jl-fab-icon { color: #ef4444; }
  .jl-fab-ring {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2.5px solid #b6f08c;
    opacity: 0;
  }
  .jl-fab[data-state="listening"] .jl-fab-ring,
  .jl-fab[data-state="speaking"] .jl-fab-ring {
    animation: jl-ring-pulse 1.6s ease-in-out infinite;
  }
  .jl-fab[data-state="thinking"] .jl-fab-ring {
    animation: jl-ring-spin 1s linear infinite;
    opacity: 0.7;
  }
  .jl-waves {
    display: none;
    gap: 2px;
    align-items: center;
    height: 20px;
  }
  .jl-fab[data-state="speaking"] .jl-waves { display: flex; }
  .jl-fab[data-state="speaking"] .jl-fab-icon-wrap { display: none; }
  .jl-wave-bar {
    width: 3px;
    border-radius: 2px;
    background: #5ccb33;
  }
  .jl-wave-bar:nth-child(1) { animation: jl-bar 0.9s 0s ease-in-out infinite; }
  .jl-wave-bar:nth-child(2) { animation: jl-bar 0.9s 0.15s ease-in-out infinite; }
  .jl-wave-bar:nth-child(3) { animation: jl-bar 0.9s 0.3s ease-in-out infinite; }
  .jl-wave-bar:nth-child(4) { animation: jl-bar 0.9s 0.45s ease-in-out infinite; }
  @keyframes jl-ring-pulse {
    0% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 0.15; transform: scale(1.22); }
    100% { opacity: 0.7; transform: scale(1); }
  }
  @keyframes jl-ring-spin {
    from { transform: rotate(0deg); opacity: 0.6; }
    to { transform: rotate(360deg); opacity: 0.6; }
  }
  @keyframes jl-bar {
    0%, 100% { height: 4px; }
    50% { height: 18px; }
  }
`;

export function FloatingButton({
  state,
  active,
  onClick,
  onEndCall
}: {
  state: ConversationState;
  active: boolean;
  onClick: () => void;
  onEndCall: () => void;
}) {
  return (
    <>
      <style>{STYLES}</style>
      <div className="jl-fab-wrap" data-active={active ? "true" : "false"}>
        <button className="jl-call-btn" type="button" onClick={onEndCall} aria-label="End JobLens conversation" title="End conversation">
          <PhoneOff size={16} />
        </button>
        <button className="jl-fab" data-state={state} type="button" onClick={onClick} aria-label="Talk to JobLens about this page">
          <div className="jl-fab-ring" aria-hidden="true" />
          <div className="jl-waves" aria-hidden="true">
            <div className="jl-wave-bar" style={{ height: 6 }} />
            <div className="jl-wave-bar" style={{ height: 14 }} />
            <div className="jl-wave-bar" style={{ height: 10 }} />
            <div className="jl-wave-bar" style={{ height: 18 }} />
          </div>
          <div className="jl-fab-icon-wrap">
            <Mic size={22} className="jl-fab-icon" aria-hidden="true" />
          </div>
          <span className="jl-fab-dot" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
