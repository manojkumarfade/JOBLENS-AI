import { handleRouteError, json } from "@/lib/api";
import { requireApiRole } from "@/lib/auth/roles";
import { recentAnalyses } from "@/lib/data/analyses";

export async function GET(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const user = auth.user;
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "10"), 50);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);
    const analyses = await recentAnalyses(user.id, limit, offset);
    return json({ analyses, nextOffset: analyses.length === limit ? offset + limit : null });
  } catch (error) {
    return handleRouteError(error);
  }
}
