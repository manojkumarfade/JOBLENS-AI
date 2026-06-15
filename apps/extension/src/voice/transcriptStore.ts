export interface TranscriptTurn {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  source: "web_speech";
}

const turns: TranscriptTurn[] = [];

export function appendTranscript(role: TranscriptTurn["role"], text: string, source: TranscriptTurn["source"]) {
  turns.push({ role, text, timestamp: new Date().toISOString(), source });
  return [...turns];
}

export function getTranscripts() {
  return [...turns];
}

export function clearTranscripts() {
  turns.length = 0;
}
