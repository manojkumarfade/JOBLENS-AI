"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ExtensionBridgeResponse = { ok?: boolean; error?: string };

type ChromeRuntimeBridge = {
  runtime?: {
    lastError?: { message?: string };
    sendMessage?: (
      extensionId: string,
      message: unknown,
      responseCallback: (response?: ExtensionBridgeResponse) => void
    ) => void;
  };
};

export function AuthForm({
  mode,
  fromExtension = false,
  extensionId,
  nextPath
}: {
  mode: "login" | "signup";
  fromExtension?: boolean;
  extensionId?: string;
  nextPath?: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"unknown" | "password" | "google" | "new">(mode === "signup" ? "password" : "unknown");

  useEffect(() => {
    if (!fromExtension) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.access_token) {
        await sendExtensionToken(data.session.access_token);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromExtension]);

  async function sendExtensionToken(accessToken: string) {
    if (!extensionId) {
      setMessage("Missing extension ID. Reopen the JobLens extension popup and start sign-in again.");
      return true;
    }
    const exchange = await fetch("/api/extension-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supabaseAccessToken: accessToken, extensionId })
    });
    if (exchange.ok) {
      const body = await exchange.json();
      const deliveredDirectly = await sendTokenDirectlyToExtension(body.extensionToken, body.expiresAt);
      if (deliveredDirectly) {
        setMessage("You're signed in - reopen the JobLens extension popup.");
        return true;
      }

      window.postMessage(
        {
          type: "JOBLENS_EXTENSION_TOKEN",
          extensionToken: body.extensionToken,
          expiresAt: body.expiresAt
        },
        window.location.origin
      );
      setMessage("You're signed in - reopen the JobLens extension popup. If it still shows signed out, reload the unpacked extension.");
      return true;
    }
    const body = await exchange.json().catch(() => null);
    setMessage(body?.error?.message ?? "Could not link this extension. Add the extension ID in your candidate dashboard, then try again.");
    return true;
  }

  async function sendTokenDirectlyToExtension(extensionToken: string, expiresAt?: string) {
    if (!extensionId) return false;
    const chromeRuntime = (window as unknown as { chrome?: ChromeRuntimeBridge }).chrome?.runtime;
    const sendMessage = chromeRuntime?.sendMessage;
    if (!sendMessage) return false;

    return new Promise<boolean>((resolve) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      }, 1500);

      sendMessage(
        extensionId,
        { type: "STORE_EXTENSION_TOKEN", payload: { token: extensionToken, expiresAt } },
        (response) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          if (chromeRuntime.lastError) {
            resolve(false);
            return;
          }
          resolve(Boolean(response?.ok));
        }
      );
    });
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage("");
    const extensionQuery = extensionId ? `&extensionId=${encodeURIComponent(extensionId)}` : "";
    const next = fromExtension
      ? `/login?from=extension&oauth=success${extensionQuery}`
      : mode === "signup"
        ? "/onboarding/role"
        : nextPath ?? "/dashboard";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "login" && loginMethod === "unknown") {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = await res.json().catch(() => null);
      const method = body?.method === "google" ? "google" : body?.method === "password" ? "password" : "new";
      setLoginMethod(method);
      setMessage(method === "google" ? "Use Google to continue." : method === "new" ? "No account found. Create an account first." : "");
      setLoading(false);
      return;
    }

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }

    const session = result.data.session ?? (await supabase.auth.getSession()).data.session;
    if (fromExtension && session?.access_token) {
      if (await sendExtensionToken(session.access_token)) {
        setLoading(false);
        return;
      }
    }

    router.push(mode === "signup" ? "/onboarding/role" : nextPath ?? "/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "signup" ? "Create your account" : "Welcome back"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle} disabled={loading}>
            <Chrome className="h-4 w-4" /> Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>Email</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-4">
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (mode === "login") setLoginMethod("unknown");
              }}
              required
            />
          </div>
          {mode === "signup" || loginMethod === "password" ? (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
          ) : null}
          {mode === "login" && loginMethod === "google" ? (
            <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle} disabled={loading}>
              <Chrome className="h-4 w-4" /> Continue with Google
            </Button>
          ) : null}
          {mode === "login" && loginMethod === "new" ? (
            <Button asChild variant="outline" className="w-full">
              <a href="/signup">Create an account</a>
            </Button>
          ) : null}
          {message ? <p className="rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
          {mode === "signup" || loginMethod === "unknown" || loginMethod === "password" ? (
            <Button type="submit" className="w-full" disabled={loading}>
              <Mail className="h-4 w-4" /> {loading ? "Working..." : mode === "signup" ? "Sign up with email" : loginMethod === "unknown" ? "Continue with email" : "Log in with email"}
            </Button>
          ) : null}
          {mode === "login" ? (
            <p className="text-sm text-muted-foreground">
              If Supabase says email limit exceeded, use Google login or configure custom SMTP in Supabase Auth.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
