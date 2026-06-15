import Link from "next/link";
import { AuthForm } from "@/components/dashboard/AuthForm";
import { MarketingPage } from "@/components/marketing/MarketingShell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ extensionId?: string; from?: string }> }) {
  const params = await searchParams;
  return (
    <MarketingPage showVoiceDemo={false}>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <AuthForm mode="login" fromExtension={params.from === "extension"} extensionId={params.extensionId} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to JobLens? <Link href="/signup" className="text-primary">Create an account</Link>
        </p>
      </main>
    </MarketingPage>
  );
}
