const viteEnv = (import.meta as unknown as { env?: { VITE_JOBLENS_API_BASE_URL?: string } }).env;

export const API_BASE_URL = (viteEnv?.VITE_JOBLENS_API_BASE_URL ?? "https://joblenswithai.vercel.app").replace(/\/$/, "");
