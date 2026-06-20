"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/lib/auth/clientFetch";

type ChromeRuntimeBridge = {
  runtime?: {
    lastError?: { message?: string };
    sendMessage?: (
      extensionId: string,
      message: unknown,
      responseCallback: (response?: { ok?: boolean; error?: string }) => void
    ) => void;
  };
};

export function ExtensionConnectClient({ extensionId, userEmail }: { extensionId: string; userEmail: string | null }) {
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [message, setMessage] = useState("Connecting this Chrome extension to your signed-in JobLens account...");

  async function sendTokenDirectly(extensionToken: string, expiresAt?: string, email?: string | null) {
    const sendMessage = (window as unknown as { chrome?: ChromeRuntimeBridge }).chrome?.runtime?.sendMessage;
    if (!sendMessage) return false;

    return new Promise<boolean>((resolve) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      }, 2000);

      sendMessage(
        extensionId,
        { type: "STORE_EXTENSION_TOKEN", payload: { token: extensionToken, expiresAt, userEmail: email ?? null } },
        (response) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          const lastError = (window as unknown as { chrome?: ChromeRuntimeBridge }).chrome?.runtime?.lastError;
          if (lastError || response?.ok !== true) {
            setMessage(response?.error ?? lastError?.message ?? "The extension rejected this account. Use the same Google account already linked in the extension, or reset the extension account from the popup.");
            resolve(false);
            return;
          }
          resolve(true);
        }
      );
    });
  }

  async function connect() {
    setStatus("connecting");
    setMessage("Connecting this Chrome extension to your signed-in JobLens account...");
    const res = await authFetch("/api/extension-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extensionId })
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      setStatus("error");
      setMessage(body?.error?.message ?? "Could not connect the extension.");
      return;
    }

    const delivered = await sendTokenDirectly(body.extensionToken, body.expiresAt, body.userEmail ?? userEmail);
    if (!delivered) {
      setStatus("error");
      return;
    }
    setStatus("connected");
    setMessage("Extension connected. Open any webpage and click the JobLens button.");
  }

  useEffect(() => {
    void connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensionId]);

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <div className="mb-2 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
          {status === "error" ? <ShieldAlert className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
        <CardTitle>{status === "connected" ? "Extension connected" : status === "error" ? "Connection needs attention" : "Connecting extension"}</CardTitle>
        <CardDescription>
          Signed in as {userEmail ?? "your JobLens account"}. Recruiter accounts cannot use the Browser Copilot extension.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-md border bg-muted p-3 text-sm">{message}</p>
        <div className="flex flex-wrap gap-2">
          {status === "error" ? <Button onClick={connect}>Try again</Button> : null}
          <Button variant="outline" onClick={() => window.close()}>Close tab</Button>
          <Button variant="outline" asChild>
            <a href="/dashboard/candidate">Open dashboard</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
