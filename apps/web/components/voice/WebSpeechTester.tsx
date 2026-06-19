"use client";

import { Button } from "@/components/ui/button";

export function WebSpeechTester({ rate, pitch }: { rate: number; pitch: number }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        const utterance = new SpeechSynthesisUtterance("JobLens AI Browser Copilot voice output is working.");
        utterance.rate = rate;
        utterance.pitch = pitch;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
      }}
    >
      Test browser voice
    </Button>
  );
}
