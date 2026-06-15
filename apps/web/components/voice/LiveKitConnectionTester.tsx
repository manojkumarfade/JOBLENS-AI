"use client";

import { Button } from "@/components/ui/button";

export function LiveKitConnectionTester({ onTest }: { onTest: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onTest}>
      Test LiveKit connection
    </Button>
  );
}
