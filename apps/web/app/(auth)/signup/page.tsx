import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/dashboard/AuthForm";
import { MarketingPage } from "@/components/marketing/MarketingShell";
import { getRoleForUser, safeDashboardRedirect } from "@/lib/auth/roles";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const user = await getAuthenticatedUser();
  if (user) {
    const role = await getRoleForUser(user.id);
    redirect(safeDashboardRedirect(params.next ?? "/dashboard", role));
  }
  return (
    <MarketingPage showVoiceDemo={false}>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <AuthForm mode="signup" nextPath={params.next} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href={`/login${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`} className="text-primary">Log in</Link>
        </p>
      </main>
    </MarketingPage>
  );
}
