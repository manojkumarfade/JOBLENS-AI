"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName })
    });
    if (res.ok) {
      router.push("/onboarding/role");
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setMessage(body?.error?.message ?? "Could not save your name.");
      setSaving(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>What should we call you?</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Display name" required />
            {message ? <p className="rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
            <Button type="submit" className="w-full" disabled={saving}>{saving ? "Saving..." : "Continue"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
