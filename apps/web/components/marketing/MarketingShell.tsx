import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FloatingVoiceDemo } from "@/components/marketing/FloatingVoiceDemo";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/55 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          JobLens Voice
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#about">About</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/install-extension">Install</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/install-extension">Install</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>JobLens Voice helps job seekers make clearer, more truthful application decisions.</p>
        <div className="flex gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
      </div>
    </footer>
  );
}

export function MarketingPage({ children, showVoiceDemo = true }: { children: React.ReactNode; showVoiceDemo?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      {children}
      <MarketingFooter />
      {showVoiceDemo ? <FloatingVoiceDemo /> : null}
    </div>
  );
}
