"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SecuritySettingsPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function changeEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ email });
    setMessage(error ? error.message : "Check your inbox to confirm the new email address.");
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Security settings</h1>
        <p className="mt-2 text-muted-foreground">Manage account access and email confirmation.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Change email</CardTitle>
          <CardDescription>Supabase sends a confirmation email to the new address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changeEmail} className="flex flex-col gap-3 sm:flex-row">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="new@email.com" required />
            <Button type="submit" disabled={saving}>{saving ? "Sending..." : "Send confirmation"}</Button>
          </form>
          {message ? <p className="mt-3 rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
