import Link from "next/link";
import { BarChart3, BriefcaseBusiness, Chrome, FileText, Home, LogOut, Settings, Sparkles } from "lucide-react";
import type { UserRole } from "@/lib/data/users";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const candidateItems = [
  { href: "/dashboard/candidate", label: "Dashboard", icon: Home },
  { href: "/dashboard/candidate/extension", label: "Browser Copilot", icon: Chrome },
  { href: "/dashboard/candidate/resume", label: "Resume", icon: FileText },
  { href: "/dashboard/candidate/history", label: "History", icon: BarChart3 },
  { href: "/dashboard/settings/voice", label: "AI Settings", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

const recruiterItems = [
  { href: "/dashboard/recruiter", label: "Recruiter Dashboard", icon: BriefcaseBusiness },
  { href: "/dashboard/recruiter/jobs", label: "Jobs", icon: FileText },
  { href: "/dashboard/recruiter/candidates", label: "Candidates", icon: BarChart3 },
  { href: "/dashboard/recruiter/rankings", label: "Rankings", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardNav({ plan = "free", role = "candidate" }: { plan?: string | null; role?: UserRole }) {
  const items = role === "recruiter" ? recruiterItems : candidateItems;
  const home = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate";
  const mobileColumns = role === "recruiter" ? "grid-cols-6" : "grid-cols-7";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background p-4 md:flex md:flex-col">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href={home} className="text-lg font-semibold">JobLens AI Browser Copilot</Link>
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
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" title="Settings" aria-label="Settings">
              <Link href="/dashboard/settings"><Settings className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="ghost" size="icon" title="Log out" aria-label="Log out">
              <Link href="/logout"><LogOut className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </aside>
      <nav className={cn("fixed inset-x-0 bottom-0 z-40 grid border-t bg-background md:hidden", mobileColumns)}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-2 py-2 text-[11px] text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link href="/logout" className="flex flex-col items-center gap-1 px-2 py-2 text-[11px] text-muted-foreground">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Link>
      </nav>
    </>
  );
}
