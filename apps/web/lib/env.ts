export function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function appUrl() {
  return env("NEXT_PUBLIC_APP_URL", "http://localhost:3000").replace(/\/$/, "");
}

export function boolEnv(name: string, fallback: boolean) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}
