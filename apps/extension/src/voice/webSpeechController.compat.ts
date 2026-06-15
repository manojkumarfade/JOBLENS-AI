import type { ExtractedPageContext } from "@joblens/shared";
import { apiFetch } from "../apiClient";
import { appendTranscript, type TranscriptTurn } from "./transcriptStore";

type WebSpeechCallbacks = {
  onState: (state: string, message?: string) => void;
  onTranscript: (turn: TranscriptTurn) => void;
  onSessionId?: (voiceSessionId: string) => void;
};

type WebSpeechAnswer = {
  answer: string;
  shouldSpeak: boolean;
  voiceSessionId?: string | null;
  modelMeta?: { model: string; provider: string; viaByok?: boolean };
};

export async function askWebSpeechQuestion(input: {
  page: ExtractedPageContext;
  question: string;
  voiceSessionId?: string;
} & WebSpeechCallbacks) {
  const userTurn = appendTranscript("user", input.question, "web_speech");
  input.onTranscript(userTurn[userTurn.length - 1]);
  input.onState("thinking");

  try {
    const answer = await apiFetch<WebSpeechAnswer>("/api/voice/web-speech/ask", {
      method: "POST",
      body: JSON.stringify({ page: input.page, question: input.question, voiceSessionId: input.voiceSessionId })
    });
    if (answer.voiceSessionId) input.onSessionId?.(answer.voiceSessionId);
    const assistantTurn = appendTranscript("assistant", answer.answer, "web_speech");
    input.onTranscript(assistantTurn[assistantTurn.length - 1]);
    input.onState("speaking", answer.modelMeta ? `${answer.modelMeta.model}${answer.modelMeta.viaByok ? " (your key)" : ""}` : undefined);
    if (answer.shouldSpeak) speak(answer.answer, () => input.onState("listening"));
    else input.onState("listening");
  } catch (error) {
    input.onState("error", error instanceof Error ? error.message : "Voice answer failed.");
  }
}

function speak(text: string, onEnd: () => void) {
  if (!("speechSynthesis" in window)) {
    onEnd();
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  speechSynthesis.speak(utterance);
}
