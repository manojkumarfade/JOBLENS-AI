import type { ExtractedPageContext } from "@joblens/shared";
import { apiFetch } from "../apiClient";

export type ConversationState =
  | "idle"
  | "preparing"
  | "mic_ready"
  | "listening"
  | "hearing_audio"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "ended"
  | "error";

export type TranscriptUpdate = {
  interimTranscript: string;
  finalTranscript: string;
};

export type ConversationCallbacks = {
  onState: (state: ConversationState, detail?: string) => void;
  onTranscript: (update: TranscriptUpdate) => void;
  onAssistantSubtitle?: (text: string) => void;
  onSessionId?: (id: string) => void;
  onDebug?: (message: string) => void;
  onError?: (msg: string) => void;
};

export type ConversationHandle = {
  stop: () => void;
  barge: () => void;
};

type RecognitionCtor = new () => SpeechRecognitionLike;
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0?: { transcript?: string };
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};
type SpeechRecognitionErrorLike = {
  error: string;
  message?: string;
};

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onsoundstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onnomatch: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  }
}

export function browserSupportsWebSpeech(): boolean {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) && "speechSynthesis" in window;
}

function getSpeechRecognition(): SpeechRecognitionLike | null {
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
  voice_b: { pitch: 1.12, rate: 1.06, voiceIndex: 1 },
  voice_c: { pitch: 0.9, rate: 0.94, voiceIndex: 2 }
};

export function startConversation(
  page: ExtractedPageContext,
  callbacks: ConversationCallbacks,
  opts: {
    lang?: string;
    voiceId?: VoiceOption["id"];
    voiceSessionId?: string;
    debug?: boolean;
  } = {}
): ConversationHandle {
  const { lang = "en-US", voiceId = "voice_a", debug = false } = opts;
  let voiceSessionId = opts.voiceSessionId;
  let active = true;
  let recognition: SpeechRecognitionLike | null = null;
  let expectedAbort = false;
  let submitting = false;
  let finalTranscript = "";
  let interimTranscript = "";
  let submitTimer: number | null = null;
  let speakingCancel: (() => void) | null = null;

  function debugEvent(message: string) {
    if (debug) callbacks.onDebug?.(message);
  }

  function setState(state: ConversationState, detail?: string) {
    callbacks.onState(state, detail);
  }

  function publishTranscript() {
    callbacks.onTranscript({
      interimTranscript: lastWords(interimTranscript, 20),
      finalTranscript: lastWords(finalTranscript, 20)
    });
  }

  function clearSubmitTimer() {
    if (submitTimer !== null) window.clearTimeout(submitTimer);
    submitTimer = null;
  }

  function scheduleSubmit(delay = 1000) {
    clearSubmitTimer();
    submitTimer = window.setTimeout(() => {
      void submitFinalTranscript();
    }, delay);
  }

  async function requestMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      const message =
        name === "NotAllowedError" || name === "SecurityError"
          ? "Microphone permission blocked. Allow mic access for this site."
          : "No microphone found.";
      setState("error", message);
      callbacks.onError?.(message);
      return false;
    }
  }

  async function beginListeningTurn() {
    if (!active || submitting) return;
    speakingCancel?.();
    speakingCancel = null;
    clearSubmitTimer();
    finalTranscript = "";
    interimTranscript = "";
    publishTranscript();

    setState("preparing", "Preparing microphone...");
    if (!(await requestMicrophone())) return;

    recognition?.abort();
    const rec = getSpeechRecognition();
    if (!rec) {
      const message = "Speech recognition unavailable. Use Chrome or Edge.";
      setState("error", message);
      callbacks.onError?.(message);
      return;
    }

    recognition = rec;
    expectedAbort = false;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onstart = () => {
      debugEvent("recognition started");
      setState("mic_ready", "Mic ready");
    };
    rec.onaudiostart = () => {
      debugEvent("audio started");
      setState("mic_ready", "Mic ready");
    };
    rec.onsoundstart = () => {
      debugEvent("sound detected");
      setState("hearing_audio", "Hearing audio...");
    };
    rec.onspeechstart = () => {
      debugEvent("speech started");
      setState("transcribing", "Transcribing...");
    };
    rec.onspeechend = () => {
      debugEvent("speech ended");
      if (finalTranscript.trim()) scheduleSubmit(750);
      else setState("listening", "Listening...");
    };
    rec.onnomatch = () => {
      debugEvent("no match");
      setState("listening", "No speech detected");
    };
    rec.onresult = (event) => {
      debugEvent("result received");
      let nextInterim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result?.[0]?.transcript?.trim() ?? "";
        if (!text) continue;
        if (result.isFinal) finalTranscript = `${finalTranscript} ${text}`.trim();
        else nextInterim = `${nextInterim} ${text}`.trim();
      }
      interimTranscript = nextInterim;
      publishTranscript();
      setState("transcribing", finalTranscript ? `I heard: ${lastWords(finalTranscript, 10)}` : "Transcribing...");
      if (finalTranscript.trim()) scheduleSubmit(1100);
    };
    rec.onerror = (event) => {
      debugEvent(`recognition error: ${event.error}`);
      if (!active) return;
      if (event.error === "aborted" && expectedAbort) return;
      if (event.error === "no-speech") {
        setState("listening", "No speech detected");
        return;
      }
      const message = recognitionErrorMessage(event.error);
      setState("error", message);
      callbacks.onError?.(message);
    };
    rec.onend = () => {
      debugEvent("recognition ended");
      if (!active || submitting || expectedAbort) return;
      window.setTimeout(() => {
        if (active && !submitting) beginListeningTurn();
      }, 250);
    };

    try {
      rec.start();
      setState("listening", "Listening...");
    } catch {
      debugEvent("duplicate recognition start ignored");
    }
  }

  async function submitFinalTranscript() {
    clearSubmitTimer();
    const question = finalTranscript.trim();
    if (!active || submitting || !question) return;
    submitting = true;
    interimTranscript = "";
    publishTranscript();
    expectedAbort = true;
    recognition?.stop();
    recognition = null;
    setState("thinking", "Thinking...");
    debugEvent("API request started");

    try {
      const data = await apiFetch<{
        answer: string;
        shouldSpeak: boolean;
        sourceType?: string;
        usedResume?: boolean;
        voiceSessionId?: string | null;
        modelMeta?: { model: string; provider: string; viaByok?: boolean };
      }>("/api/voice/web-speech/ask", {
        method: "POST",
        body: JSON.stringify({ page, question, voiceSessionId, persistTranscript: false })
      });

      debugEvent("API answer received");
      if (data.voiceSessionId) {
        voiceSessionId = data.voiceSessionId;
        callbacks.onSessionId?.(data.voiceSessionId);
      }

      if (!active) return;
      setState("speaking", "Speaking...");
      callbacks.onAssistantSubtitle?.(lastWords(data.answer, 18));

      if (data.shouldSpeak) {
        speakingCancel = speakAnswer(data.answer, voiceId, {
          onStart: () => debugEvent("TTS started"),
          onChunk: (text) => callbacks.onAssistantSubtitle?.(lastWords(text, 18)),
          onEnd: () => {
            debugEvent("TTS ended");
            speakingCancel = null;
            submitting = false;
            callbacks.onAssistantSubtitle?.("");
            if (active) void beginListeningTurn();
          },
          onError: (message) => {
            speakingCancel = null;
            submitting = false;
            setState("error", message);
            callbacks.onError?.(message);
          }
        });
      } else {
        submitting = false;
        void beginListeningTurn();
      }
    } catch (error) {
      submitting = false;
      const message = error instanceof Error ? error.message : "Voice answer failed.";
      setState("error", message);
      callbacks.onError?.(message);
    }
  }

  setState("preparing", "Preparing microphone...");
  void beginListeningTurn();

  return {
    stop() {
      active = false;
      clearSubmitTimer();
      expectedAbort = true;
      recognition?.abort();
      recognition = null;
      speakingCancel?.();
      speakingCancel = null;
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      callbacks.onAssistantSubtitle?.("");
      callbacks.onTranscript({ interimTranscript: "", finalTranscript: "" });
      setState("ended");
    },
    barge() {
      speakingCancel?.();
      speakingCancel = null;
      submitting = false;
      if (active) void beginListeningTurn();
    }
  };
}

export function speakTestVoice(voiceId: VoiceOption["id"] = "voice_a") {
  return new Promise<void>((resolve, reject) => {
    speakAnswer("JobLens voice output is working.", voiceId, {
      onStart: () => undefined,
      onChunk: () => undefined,
      onEnd: resolve,
      onError: reject
    });
  });
}

function speakAnswer(
  text: string,
  voiceId: VoiceOption["id"],
  callbacks: {
    onStart: () => void;
    onChunk: (text: string) => void;
    onEnd: () => void;
    onError: (message: string) => void;
  }
) {
  if (!("speechSynthesis" in window)) {
    callbacks.onError("Browser voice output is unavailable.");
    return () => undefined;
  }

  let cancelled = false;
  const chunks = chunkForSpeech(text);
  const cfg = VOICE_CONFIGS[voiceId];
  speechSynthesis.cancel();

  void loadVoices().then((voices) => {
    if (cancelled) return;
    callbacks.onStart();
    let index = 0;

    function speakNext() {
      if (cancelled) return;
      const chunk = chunks[index];
      if (!chunk) {
        callbacks.onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.pitch = cfg.pitch;
      utterance.rate = cfg.rate;
      if (voices.length > cfg.voiceIndex) utterance.voice = voices[cfg.voiceIndex];
      callbacks.onChunk(chunk);
      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = () => {
        if (!cancelled) callbacks.onError("Browser voice output failed. Check audio settings and try again.");
      };
      utterance.onpause = () => callbacks.onChunk(chunk);
      utterance.onresume = () => callbacks.onChunk(chunk);
      speechSynthesis.speak(utterance);
    }

    speakNext();
  });

  return () => {
    cancelled = true;
    speechSynthesis.cancel();
  };
}

function loadVoices() {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    const timer = window.setTimeout(() => resolve(speechSynthesis.getVoices()), 600);
    speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timer);
      resolve(speechSynthesis.getVoices());
    };
  });
}

function chunkForSpeech(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return ["I do not have an answer yet."];
  const sentences = clean.match(/[^.!?]+[.!?]*/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();
    if (next.length > 220 && current) {
      chunks.push(current);
      current = sentence.trim();
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks.flatMap((chunk) => (chunk.length <= 260 ? [chunk] : chunk.match(/.{1,240}(?:\s|$)/g)?.map((item) => item.trim()).filter(Boolean) ?? [chunk]));
}

function recognitionErrorMessage(error: string) {
  if (error === "not-allowed" || error === "service-not-allowed") return "Microphone permission blocked. Allow mic access for this site.";
  if (error === "audio-capture") return "No microphone found.";
  if (error === "network") return "Speech recognition network error. Try again.";
  if (error === "no-speech") return "No speech detected.";
  return `Speech recognition failed: ${error || "unknown error"}.`;
}

function lastWords(text: string, count: number) {
  return text.split(/\s+/).filter(Boolean).slice(-count).join(" ");
}
