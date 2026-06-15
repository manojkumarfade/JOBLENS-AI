"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";

type SpeechRecognitionCtor = new () => SpeechRecognition;

declare global {
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
  }

  interface SpeechRecognitionResult {
    readonly 0: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
  }

  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function FloatingVoiceDemo() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => stop, []);

  async function start() {
    setOpen(true);
    setError("");
    setTranscript("");
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("SpeechRecognition is not available in this browser. Try Chrome.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (const value of data) {
          const normalized = value / 255;
          sum += normalized * normalized;
        }
        setLevel(Math.min(Math.sqrt(sum / data.length) * 3, 1));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0]?.transcript ?? "")
          .join(" ")
          .trim();
        setTranscript(text);
      };
      recognition.onerror = (event) => setError(event.error || "Speech recognition failed.");
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch {
      setError("Microphone permission was denied or unavailable.");
      stop();
    }
  }

  function stop() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setListening(false);
    setLevel(0);
  }

  function close() {
    stop();
    setOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[min(360px,calc(100vw-2rem))] rounded-lg border bg-card/95 p-4 shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Live voice demo</p>
              <p className="text-xs text-muted-foreground">{listening ? "Listening from your microphone" : "Click start to record"}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={close} aria-label="Close voice demo">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <VoicePoweredOrb className="h-28 w-28 shrink-0" enableVoiceControl={listening} externalLevel={level} hue={20} />
            <div className="min-w-0 flex-1 rounded-md border bg-background p-3 text-sm">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Transcript</p>
              <p className="min-h-14 break-words">{transcript || "Your words will appear here after microphone permission."}</p>
            </div>
          </div>
          {error ? <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{error}</p> : null}
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={start} disabled={listening} className="flex-1">
              <Mic className="h-4 w-4" /> Start
            </Button>
            <Button type="button" onClick={stop} disabled={!listening} variant="outline" className="flex-1">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={() => setOpen(true)} className="rounded-full px-5 shadow-2xl">
          <Mic className="h-4 w-4" /> Voice demo
        </Button>
      )}
    </div>
  );
}
