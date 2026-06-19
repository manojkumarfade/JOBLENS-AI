"use client";

import { useEffect, useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ExtensionLink = {
  id: string;
  extension_id: string;
  label: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
};

export function ExtensionLinksCard() {
  const [links, setLinks] = useState<ExtensionLink[]>([]);
  const [extensionId, setExtensionId] = useState("");
  const [label, setLabel] = useState("My Chrome extension");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/extension-links");
    const body = await res.json().catch(() => null);
    if (res.ok) setLinks(body.links ?? []);
    else setMessage(body?.error?.message ?? "Could not load linked extensions.");
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Saving extension ID...");
    const res = await fetch("/api/extension-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extensionId, label })
    });
    const body = await res.json().catch(() => null);
    if (res.ok) {
      setMessage("Extension linked. You can sign in from the extension popup now.");
      setExtensionId("");
      await load();
    } else {
      setMessage(body?.error?.message ?? "Could not link extension.");
    }
    setSaving(false);
  }

  async function revoke(id: string) {
    setMessage("Revoking extension...");
    const res = await fetch("/api/extension-links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const body = await res.json().catch(() => null);
    setMessage(res.ok ? "Extension revoked." : body?.error?.message ?? "Could not revoke extension.");
    if (res.ok) await load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Linked Extension IDs</CardTitle>
        <CardDescription>Copy the Chrome extension ID from the popup, paste it here, then sign in from the extension.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={save} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <Input value={extensionId} onChange={(event) => setExtensionId(event.target.value.toLowerCase())} placeholder="32-character extension ID" required />
          <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label" />
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Link Extension"}</Button>
        </form>
        <div className="grid gap-2">
          {loading ? <p className="text-sm text-muted-foreground">Loading linked extensions...</p> : null}
          {!loading && links.length === 0 ? <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">No extension linked yet.</p> : null}
          {links.map((link) => (
            <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm">
              <div>
                <p className="font-medium">{link.label ?? "Chrome extension"}</p>
                <p className="font-mono text-xs text-muted-foreground">{link.extension_id}</p>
                <p className="text-xs text-muted-foreground">Last used: {link.last_used_at ? new Date(link.last_used_at).toLocaleString() : "Never"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={link.is_active && !link.revoked_at ? "default" : "outline"}>{link.is_active && !link.revoked_at ? "Active" : "Revoked"}</Badge>
                {link.is_active && !link.revoked_at ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => revoke(link.id)}>
                    <Trash2 className="h-4 w-4" /> Revoke
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {message ? <p className="rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
