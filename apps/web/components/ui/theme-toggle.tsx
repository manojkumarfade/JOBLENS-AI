"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const cycle = ["light", "dark", "system"] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid hydration mismatch while next-themes resolves the stored preference.
    setMounted(true);
  }, []);

  const current = mounted ? theme ?? "system" : "system";
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const CurrentIcon = current === "system" ? Monitor : isDark ? Moon : Sun;

  function nextTheme() {
    const index = cycle.indexOf((current as (typeof cycle)[number]) ?? "system");
    setTheme(cycle[(index + 1) % cycle.length]);
  }

  return (
    <button
      type="button"
      className={cn(
        "focus-ring flex h-9 w-[4.5rem] items-center rounded-full border p-1 transition-all duration-300",
        isDark ? "border-zinc-700 bg-zinc-950" : "border-zinc-200 bg-white",
        className
      )}
      onClick={nextTheme}
      title={`Theme: ${current}`}
      aria-label={`Theme: ${current}`}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300",
          isDark ? "translate-x-0 bg-zinc-800 text-white" : "translate-x-8 bg-zinc-100 text-zinc-800"
        )}
      >
        <CurrentIcon className="h-4 w-4" strokeWidth={1.6} />
      </span>
    </button>
  );
}
