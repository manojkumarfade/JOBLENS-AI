"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsClient({ email, name }: { email?: string | null; name?: string | null }) {
  const [message, setMessage] = useState("");

  async function deleteData() {
    if (!confirm("Delete analyses, transcripts, page contexts, credentials, and resume files?")) return;
    const res = await fetch("/api/privacy/delete-data", { method: "POST" });
    setMessage(res.ok ? "Your JobLens data was deleted." : "Could not delete data.");
  }

  async function deleteAccount() {
    if (!confirm("Delete your account and all associated data?")) return;
    const res = await fetch("/api/privacy/delete-account", { method: "POST" });
    setMessage(res.ok ? "Account deletion requested." : "Could not delete account.");
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Name: {name ?? "Not set"}</p>
          <p>Email: {email ?? "Not set"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="outline"><Link href="/dashboard/settings/voice">Voice settings</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/billing">Billing</Link></Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Privacy controls</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={deleteData}>Delete my data</Button>
          <Button variant="destructive" onClick={deleteAccount}>Delete account</Button>
        </CardContent>
      </Card>
      {message ? <p className="rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
    </div>
  );
}
