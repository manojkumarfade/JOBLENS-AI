import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FloatingVoiceDemo } from "@/components/marketing/FloatingVoiceDemo";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-lg font-bold tracking-normal">
          JobLens
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/install-extension">Install Extension</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/85">
            <Link href="/install-extension">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

const footerGroups = [
  { title: "Product", links: [["Install", "/install-extension"], ["Pricing", "/pricing"], ["Dashboard", "/dashboard"]] },
  { title: "Company", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Contact", "mailto:hello@joblens.local"]] },
  { title: "Social", links: [["LinkedIn", "https://www.linkedin.com"], ["X", "https://x.com"]] },
  { title: "Legal", links: [["Privacy policy", "/privacy"], ["Terms of use", "/terms"]] }
];

export function MarketingFooter() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="font-display text-2xl font-bold">JobLens</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Voice-first job clarity for candidates who want truthful, faster application decisions.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="font-semibold text-foreground">{group.title}</p>
              <div className="mt-3 grid gap-2 text-muted-foreground">
                {group.links.map(([label, href]) => (
                  <Link key={label} href={href}>{label}</Link>
                ))}
              </div>
            </div>
          ))}
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
