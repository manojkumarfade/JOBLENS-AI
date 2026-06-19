import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/dashboard/AuthForm";
import { MarketingPage } from "@/components/marketing/MarketingShell";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getRoleForUser, safeDashboardRedirect } from "@/lib/auth/roles";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ extensionId?: string; from?: string; next?: string }> }) {
  const params = await searchParams;
  const user = await getAuthenticatedUser();
  if (user && params.from !== "extension") {
    const role = await getRoleForUser(user.id);
    redirect(safeDashboardRedirect(params.next ?? "/dashboard", role));
  }
  return (
    <MarketingPage showVoiceDemo={false}>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <AuthForm mode="login" fromExtension={params.from === "extension"} extensionId={params.extensionId} nextPath={params.next} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to JobLens? <Link href={`/signup${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`} className="text-primary">Create an account</Link>
        </p>
      </main>
    </MarketingPage>
  );
}
