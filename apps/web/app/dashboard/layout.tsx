import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SupabaseSetupNotice } from "@/components/dashboard/SupabaseSetupNotice";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/data/users";
import { isMissingSupabaseSchemaError, supabaseSetupMessage } from "@/lib/supabase/schema";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  let profile = null;
  try {
    profile = await getProfile(user.id);
  } catch (error) {
    if (isMissingSupabaseSchemaError(error)) {
      return <SupabaseSetupNotice detail={supabaseSetupMessage()} />;
    }
    throw error;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav plan={profile?.plan ?? "free"} />
      <main className="pb-20 md:ml-64 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
