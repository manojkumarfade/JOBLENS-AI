export interface TranscriptTurn {
  role: "user" | "assistant" | "system" | "tool";
  text: string;
  createdAt: string;
}

const turns: TranscriptTurn[] = [];

export function appendTranscript(role: TranscriptTurn["role"], text: string) {
  turns.push({ role, text, createdAt: new Date().toISOString() });
  return [...turns];
}

export function getTranscripts() {
  return [...turns];
}

export function clearTranscripts() {
  turns.length = 0;
}
