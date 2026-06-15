import { VoiceSettingsForm } from "@/components/voice/VoiceSettingsForm";

export default function VoiceSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Voice and AI settings</h1>
        <p className="mt-2 text-muted-foreground">Manage TypeGPT model settings, BYOK credentials, and browser speech behavior.</p>
      </div>
      <VoiceSettingsForm />
    </div>
  );
}
