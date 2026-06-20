"use client";

import { useEffect, useState } from "react";
import { Link2, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/extension-links");
    const body = await res.json().catch(() => null);
    if (res.ok) setLinks(body.links ?? []);
    else setMessage(body?.error?.message ?? "Could not load connected extensions.");
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function revoke(id: string) {
    setMessage("Revoking extension...");
    const res = await fetch("/api/extension-links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const body = await res.json().catch(() => null);
    setMessage(res.ok ? "Extension revoked. Reset/sign out in the popup if it was already connected." : body?.error?.message ?? "Could not revoke extension.");
    if (res.ok) await load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Connected Extensions</CardTitle>
        <CardDescription>Open the Chrome extension popup and sign in with the same Google account used for this dashboard. No manual ID copy/paste is required.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" /> {loading ? "Checking..." : "Refresh"}
          </Button>
        </div>
        <div className="grid gap-2">
          {loading ? <p className="text-sm text-muted-foreground">Loading connected extensions...</p> : null}
          {!loading && links.length === 0 ? (
            <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              No extension connection recorded yet. Use the extension popup to connect this dashboard account.
            </p>
          ) : null}
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
