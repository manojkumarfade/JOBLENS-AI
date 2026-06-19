import { redirect } from "next/navigation";
import { VoiceSettingsForm } from "@/components/voice/VoiceSettingsForm";
import { getRoleForUser } from "@/lib/auth/roles";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function VoiceSettingsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const role = await getRoleForUser(user.id);
  if (role !== "candidate") redirect("/dashboard/recruiter");
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
