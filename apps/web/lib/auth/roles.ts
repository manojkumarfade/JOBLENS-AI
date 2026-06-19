import { errorResponse } from "@/lib/api";
import { getProfile, type UserRole } from "@/lib/data/users";
import { getAuthenticatedUser, type AuthenticatedUser } from "./session";

export type RoleCheckResult =
  | { ok: true; user: AuthenticatedUser; role: UserRole }
  | { ok: false; response: Response };

export function dashboardForRole(role: UserRole) {
  return role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate";
}

export function isDashboardPathAllowedForRole(pathname: string, role: UserRole) {
  const path = pathname || "/dashboard";
  if (path === "/dashboard") return true;
  if (path.startsWith("/dashboard/settings/security") || path === "/dashboard/settings") return true;
  if (path.startsWith("/dashboard/billing")) return true;

  if (role === "candidate") {
    return (
      path.startsWith("/dashboard/candidate") ||
      path.startsWith("/dashboard/resume") ||
      path.startsWith("/dashboard/analyses") ||
      path.startsWith("/dashboard/settings/voice")
    );
  }

  return path.startsWith("/dashboard/recruiter");
}

export function safeDashboardRedirect(pathname: string | null | undefined, role: UserRole) {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) return dashboardForRole(role);
  return isDashboardPathAllowedForRole(pathname, role) ? pathname : dashboardForRole(role);
}

export async function getRoleForUser(userId: string): Promise<UserRole> {
  const profile = await getProfile(userId).catch(() => null);
  return profile?.user_role === "recruiter" ? "recruiter" : "candidate";
}

export async function requireApiRole(request: Request, allowed: UserRole | UserRole[]): Promise<RoleCheckResult> {
  const user = await getAuthenticatedUser(request);
  if (!user) return { ok: false, response: errorResponse("AUTH_REQUIRED", "Sign in first.", 401) };
  const role = await getRoleForUser(user.id);
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedRoles.includes(role)) {
    return { ok: false, response: errorResponse("FORBIDDEN", "This area is not available for your account role.", 403) };
  }
  return { ok: true, user, role };
}
