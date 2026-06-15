import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/dashboard/SettingsClient";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/data/users";

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Account settings</h1>
        <p className="mt-2 text-muted-foreground">Manage profile, theme, billing shortcuts, and privacy controls.</p>
      </div>
      <SettingsClient email={user.email} name={profile?.full_name} />
    </div>
  );
}
