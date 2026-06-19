import Link from "next/link";
import { Chrome, FileText, Home, Settings, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard/candidate", label: "Dashboard", icon: Home },
  { href: "/dashboard/candidate/extension", label: "Browser Copilot", icon: Chrome },
  { href: "/dashboard/candidate/resume", label: "Resume", icon: FileText },
  { href: "/dashboard/recruiter", label: "Recruiter AI", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardNav({ plan = "free" }: { plan?: string | null }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background p-4 md:flex md:flex-col">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard/candidate" className="text-lg font-semibold">JobLens AI Browser Copilot</Link>
          <Badge variant="secondary">{plan}</Badge>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Button key={item.href} asChild variant="ghost" className="w-full justify-start">
                <Link href={item.href}><Icon className="h-4 w-4" /> {item.label}</Link>
              </Button>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between border-t pt-4">
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" title="Settings" aria-label="Settings">
            <Link href="/dashboard/settings"><Settings className="h-4 w-4" /></Link>
          </Button>
        </div>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background md:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 px-2 py-2 text-[11px] text-muted-foreground")}>
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
