"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SupabaseSessionLike = {
  access_token?: string;
  refresh_token?: string;
};

export function AuthForm({
  mode,
  nextPath
}: {
  mode: "login" | "signup";
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
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session as SupabaseSessionLike | null;
      if (!session?.access_token || !session.refresh_token) return;

      await syncBrowserSession(session);
      router.replace(nextPath ?? "/dashboard");
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPath]);

  async function syncBrowserSession(session: SupabaseSessionLike) {
    if (!session.access_token || !session.refresh_token) return null;
    const res = await fetch("/api/auth/sync-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        next: nextPath ?? "/dashboard"
      })
    });
    return res.json().catch(() => null);
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage("");
    const next = mode === "signup" ? "/onboarding/role" : nextPath ?? "/dashboard";
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

    const session = (result.data.session ?? (await supabase.auth.getSession()).data.session) as SupabaseSessionLike | null;
    const sync = session ? await syncBrowserSession(session) : null;

    router.push(mode === "signup" ? "/onboarding/role" : sync?.redirectTo ?? nextPath ?? "/dashboard");
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
