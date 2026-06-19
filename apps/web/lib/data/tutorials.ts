import { isMissingSupabaseColumnError } from "@/lib/supabase/schema";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ProfileView } from "./users";

export type TutorialTarget = "candidate" | "recruiter";

export function tutorialColumn(target: TutorialTarget) {
  return target === "recruiter" ? "recruiter_tutorial_seen_at" : "candidate_tutorial_seen_at";
}

export async function markTutorialSeen(userId: string, target: TutorialTarget) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ [tutorialColumn(target)]: new Date().toISOString() })
    .eq("id", userId);
  if (error && !isMissingSupabaseColumnError(error, tutorialColumn(target))) throw error;
}

export function hasSeenTutorial(profile: ProfileView | null | undefined, target: TutorialTarget) {
  const value = profile?.[tutorialColumn(target)];
  return typeof value === "string" && value.length > 0;
}
