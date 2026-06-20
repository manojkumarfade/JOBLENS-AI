"use client";

import { useEffect } from "react";
import { syncBrowserSession } from "@/lib/auth/clientFetch";

export function DashboardSessionBridge() {
  useEffect(() => {
    syncBrowserSession().catch(() => {
      // The dashboard APIs still validate each request; this just keeps navigation cookies fresh.
    });
  }, []);

  return null;
}
