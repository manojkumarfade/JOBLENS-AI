import { VoiceSettingsForm } from "@/components/voice/VoiceSettingsForm";

export default function VoiceSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">AI model settings</h1>
        <p className="mt-2 text-muted-foreground">Manage TypeGPT model settings, BYOK credentials, and browser Web Speech behavior.</p>
      </div>
      <VoiceSettingsForm />
    </div>
  );
}
