import { env } from "../env";

export function planLimit(plan: string | null | undefined) {
  if (plan === "byok") return null;
  if (plan === "pro") return Number(env("PRO_ANALYSES_PER_MONTH", "200"));
  return Number(env("FREE_ANALYSES_PER_MONTH", "15"));
}
