import Link from "next/link";
import { BarChart3, CreditCard, FileText, Home, Mic, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/resume", label: "Resume", icon: FileText },
  { href: "/dashboard/analyses", label: "Analyses", icon: BarChart3 },
  { href: "/dashboard/settings/voice", label: "Voice", icon: Mic },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard }
];

export function DashboardNav({ plan = "free" }: { plan?: string | null }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background p-4 md:flex md:flex-col">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold">JobLens Voice</Link>
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
