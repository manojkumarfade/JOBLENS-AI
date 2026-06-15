import type { ExtractedPageContext } from "@joblens/shared";
import { apiFetch } from "../apiClient";
import { appendTranscript } from "./transcriptStore";
export { askWebSpeechQuestion } from "./webSpeechController.compat";

export type ConversationState =
  | "idle"
  | "preparing"
  | "listening"
  | "thinking"
  | "speaking"
  | "ended"
  | "error";

export type ConversationCallbacks = {
  onState: (state: ConversationState, detail?: string) => void;
  onUserTranscript: (text: string) => void;
  onSessionId?: (id: string) => void;
  onError?: (msg: string) => void;
};

export type ConversationHandle = {
  stop: () => void;
  barge: () => void;
};

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
    abort(): void;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onerror: ((e: { error: string }) => void) | null;
    onend: (() => void) | null;
    onspeechstart: (() => void) | null;
  }
  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
  }
}

export function browserSupportsWebSpeech(): boolean {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) && "speechSynthesis" in window;
}

function getSpeechRecognition(): SpeechRecognition | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export type VoiceOption = { id: "voice_a" | "voice_b" | "voice_c"; label: string };

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "voice_a", label: "Natural" },
  { id: "voice_b", label: "Crisp" },
  { id: "voice_c", label: "Calm" }
];

type VoiceConfig = { pitch: number; rate: number; voiceIndex: number };

const VOICE_CONFIGS: Record<VoiceOption["id"], VoiceConfig> = {
  voice_a: { pitch: 1.0, rate: 1.0, voiceIndex: 0 },
  voice_b: { pitch: 1.15, rate: 1.1, voiceIndex: 1 },
  voice_c: { pitch: 0.88, rate: 0.92, voiceIndex: 2 }
};

function speak(text: string, voiceId: VoiceOption["id"], onEnd: () => void, onBarge: () => void): () => void {
  if (!("speechSynthesis" in window)) {
    onEnd();
    return () => {};
  }

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const cfg = VOICE_CONFIGS[voiceId];
  utterance.pitch = cfg.pitch;
  utterance.rate = cfg.rate;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > cfg.voiceIndex) utterance.voice = voices[cfg.voiceIndex];

  let cancelled = false;
  utterance.onend = () => {
    if (!cancelled) onEnd();
  };
  utterance.onerror = () => {
    if (!cancelled) onEnd();
  };

  speechSynthesis.speak(utterance);

  return () => {
    cancelled = true;
    speechSynthesis.cancel();
    onBarge();
  };
}

export function startConversation(
  page: ExtractedPageContext,
  callbacks: ConversationCallbacks,
  opts: {
    lang?: string;
    voiceId?: VoiceOption["id"];
    voiceSessionId?: string;
  } = {}
): ConversationHandle {
  const { lang = "en-US", voiceId = "voice_a" } = opts;
  let voiceSessionId = opts.voiceSessionId;
  let active = true;
  let currentStopTTS: (() => void) | null = null;
  let recognition: SpeechRecognition | null = null;

  function setState(state: ConversationState, detail?: string) {
    callbacks.onState(state, detail);
  }

  function beginListeningTurn() {
    if (!active) return;
    recognition?.abort();

    const rec = getSpeechRecognition();
    if (!rec) {
      const message = "Speech recognition unavailable in this browser.";
      setState("error", message);
      callbacks.onError?.(message);
      return;
    }

    recognition = rec;
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;
    let gotResult = false;

    rec.onresult = (event) => {
      gotResult = true;
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (!transcript) {
        beginListeningTurn();
        return;
      }
      callbacks.onUserTranscript(transcript);
      void handleQuestion(transcript);
    };

    rec.onerror = (event) => {
      if (!active) return;
      if (event.error === "no-speech") {
        beginListeningTurn();
        return;
      }
      if (event.error === "aborted") return;
      setState("error", event.error || "Speech recognition failed.");
    };

    rec.onend = () => {
      if (!active || gotResult) return;
      beginListeningTurn();
    };

    rec.onspeechstart = () => {
      if (currentStopTTS) {
        currentStopTTS();
        currentStopTTS = null;
      }
    };

    setState("listening");
    try {
      rec.start();
    } catch {
      // Ignore duplicate-start errors from browser implementations.
    }
  }

  async function handleQuestion(question: string) {
    if (!active) return;
    recognition?.abort();
    recognition = null;
    setState("thinking");

    try {
      const data = await apiFetch<{
        answer: string;
        shouldSpeak: boolean;
        voiceSessionId?: string | null;
        modelMeta?: { model: string; provider: string; viaByok?: boolean };
      }>("/api/voice/web-speech/ask", {
        method: "POST",
        body: JSON.stringify({ page, question, voiceSessionId })
      });

      if (data.voiceSessionId) {
        voiceSessionId = data.voiceSessionId;
        callbacks.onSessionId?.(data.voiceSessionId);
      }

      appendTranscript("user", question, "web_speech");
      appendTranscript("assistant", data.answer, "web_speech");

      if (!active) return;
      setState("speaking", data.modelMeta?.model);

      if (data.shouldSpeak) {
        currentStopTTS = speak(
          data.answer,
          voiceId,
          () => {
            currentStopTTS = null;
            if (active) beginListeningTurn();
          },
          () => {
            currentStopTTS = null;
            if (active) beginListeningTurn();
          }
        );
      } else {
        beginListeningTurn();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Voice answer failed.";
      setState("error", message);
      callbacks.onError?.(message);
    }
  }

  setState("preparing");
  if (!voiceSessionId && page.sourceType === "job_page") {
    void handleQuestion("Summarize this job page.");
  } else {
    beginListeningTurn();
  }

  return {
    stop() {
      active = false;
      recognition?.abort();
      recognition = null;
      currentStopTTS?.();
      currentStopTTS = null;
      speechSynthesis.cancel();
      setState("ended");
    },
    barge() {
      currentStopTTS?.();
      currentStopTTS = null;
      if (active) beginListeningTurn();
    }
  };
}
