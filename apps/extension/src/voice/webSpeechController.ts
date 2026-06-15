import type { ExtractedPageContext } from "@joblens/shared";
import { apiFetch } from "../apiClient";
import { appendTranscript } from "./transcriptStore";

type RecognitionCtor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
  }

  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
  }
}

export function browserSupportsWebSpeech() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) && "speechSynthesis" in window;
}

export function startWebSpeechSession(input: {
  page: ExtractedPageContext;
  voiceSessionId?: string;
  onState: (state: string, message?: string) => void;
  onTranscript: (role: "user" | "assistant", text: string) => void;
}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    input.onState("error", "Speech recognition is not available in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
  input.onState("listening");

  recognition.onresult = async (event) => {
    const question = Array.from(event.results)
      .map((result) => result[0]?.transcript ?? "")
      .join(" ")
      .trim();
    if (!question) return;
    appendTranscript("user", question);
    input.onTranscript("user", question);
    input.onState("thinking");

    try {
      const answer = await apiFetch<{
        answer: string;
        shouldSpeak: boolean;
        modelMeta?: { model: string; provider: string; viaByok?: boolean };
      }>("/api/voice/web-speech/ask", {
        method: "POST",
        body: JSON.stringify({ page: input.page, question, voiceSessionId: input.voiceSessionId })
      });
      appendTranscript("assistant", answer.answer);
      input.onTranscript("assistant", answer.answer);
      input.onState("speaking", answer.modelMeta ? `${answer.modelMeta.model}${answer.modelMeta.viaByok ? " (your key)" : ""}` : undefined);
      if (answer.shouldSpeak) speak(answer.answer, () => input.onState("listening"));
    } catch (error) {
      input.onState("error", error instanceof Error ? error.message : "Voice answer failed.");
    }
  };

  recognition.onerror = (event) => {
    input.onState("error", event.error || "Speech recognition failed.");
  };

  recognition.onend = () => {
    if (document.visibilityState === "visible") input.onState("ended");
  };

  recognition.start();
  return () => recognition.stop();
}

function speak(text: string, onEnd: () => void) {
  if (!("speechSynthesis" in window)) {
    onEnd();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  speechSynthesis.speak(utterance);
}
