"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { getSyncedDashboardRedirect } from "@/lib/auth/clientFetch";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  button?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export function AuthAwareDashboardLink({
  href,
  children,
  className,
  button = false,
  variant,
  size
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function navigate() {
    setLoading(true);
    try {
      const redirectTo = await getSyncedDashboardRedirect(href);
      router.push(redirectTo ?? `/login?next=${encodeURIComponent(href)}`);
      router.refresh();
    } catch {
      router.push(`/login?next=${encodeURIComponent(href)}`);
    } finally {
      setLoading(false);
    }
  }

  if (button) {
    return (
      <Button type="button" className={className} variant={variant} size={size} onClick={navigate} disabled={loading}>
        {loading ? "Opening..." : children}
      </Button>
    );
  }

  return (
    <button
      type="button"
      className={cn("text-left transition-colors hover:text-foreground disabled:opacity-70", className)}
      onClick={navigate}
      disabled={loading}
    >
      {loading ? "Opening..." : children}
    </button>
  );
}
