import type { VoiceState } from "../types/messages";

export interface VoiceRuntimeState {
  state: VoiceState;
  message?: string;
  activeModelLabel?: string;
}

let current: VoiceRuntimeState = { state: "idle" };
const listeners = new Set<(state: VoiceRuntimeState) => void>();

export function setVoiceState(next: VoiceRuntimeState) {
  current = next;
  listeners.forEach((listener) => listener(current));
}

export function getVoiceState() {
  return current;
}

export function subscribeVoiceState(listener: (state: VoiceRuntimeState) => void) {
  listeners.add(listener);
  listener(current);
  return () => listeners.delete(listener);
}
