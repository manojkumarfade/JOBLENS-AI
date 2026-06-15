import Link from "next/link";
import { AuthForm } from "@/components/dashboard/AuthForm";
import { MarketingPage } from "@/components/marketing/MarketingShell";

export default function SignupPage() {
  return (
    <MarketingPage showVoiceDemo={false}>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary">Log in</Link>
        </p>
      </main>
    </MarketingPage>
  );
}
