import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "outline" | "destructive" }) {
  const styles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border text-foreground",
    destructive: "bg-destructive text-destructive-foreground"
  };
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", styles[variant], className)}
      {...props}
    />
  );
}
