import Link from "next/link";
import { Chrome, Mic, Volume2 } from "lucide-react";
import { ExtensionLinksCard } from "@/components/candidate/ExtensionLinksCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CandidateExtensionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Browser Extension</h1>
        <p className="mt-2 text-muted-foreground">Use JobLens AI Browser Copilot on any normal webpage after you click the floating voice button.</p>
      </div>
      <ExtensionLinksCard />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Chrome className="h-5 w-5" /> Setup</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>Build or load the unpacked extension, sign in from the popup, open any article, docs page, or job listing, then click the floating button.</p>
            <Button asChild><Link href="/install-extension">Open install instructions</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Troubleshooting</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>Use Chrome or Edge. If mic does not start, allow microphone permission for the current site and try again.</p>
            <p className="flex items-center gap-2"><Volume2 className="h-4 w-4" /> Browser text-to-speech uses built-in speechSynthesis, no paid TTS provider.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
