"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

let lastSyncedAccessToken: string | null = null;

type BrowserSession = {
  access_token?: string;
  refresh_token?: string;
};

async function getBrowserSession() {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session as BrowserSession | null;
}

async function syncServerSession(session: BrowserSession | null) {
  if (!session?.access_token || !session.refresh_token) return;
  if (lastSyncedAccessToken === session.access_token) return;

  const res = await fetch("/api/auth/sync-session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      next: window.location.pathname
    })
  }).catch(() => null);

  if (res?.ok) lastSyncedAccessToken = session.access_token;
}

function withAuthHeader(init: RequestInit, token?: string) {
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const session = await syncBrowserSession();

  const first = await fetch(input, {
    ...init,
    credentials: init.credentials ?? "include",
    headers: withAuthHeader(init, session?.access_token)
  });

  if (first.status !== 401) return first;

  lastSyncedAccessToken = null;
  const freshSession = await getBrowserSession();
  await syncServerSession(freshSession);

  return fetch(input, {
    ...init,
    credentials: init.credentials ?? "include",
    headers: withAuthHeader(init, freshSession?.access_token)
  });
}

export async function syncBrowserSession() {
  const session = await getBrowserSession();
  await syncServerSession(session);
  return session;
}
