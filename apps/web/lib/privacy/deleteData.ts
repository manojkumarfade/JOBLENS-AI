import { createSupabaseServiceClient } from "../supabase/server";
import { isMissingSupabaseSchemaError } from "../supabase/schema";

export async function deleteAllUserData(userId: string) {
  const supabase = createSupabaseServiceClient();
  const { data: resumes } = await supabase.from("resumes").select("file_path").eq("user_id", userId);
  const paths = (resumes ?? []).map((row) => row.file_path).filter(Boolean);
  if (paths.length) await supabase.storage.from("resumes").remove(paths);

  await deleteOwnedRows("voice_transcripts", userId);
  await deleteOwnedRows("voice_sessions", userId);
  await deleteOwnedRows("candidate_rankings", userId);
  await deleteOwnedRows("candidates", userId);
  await deleteOwnedRows("jobs", userId);
  await deleteOwnedRows("job_analyses", userId);
  await deleteOwnedRows("page_contexts", userId);
  await deleteOwnedRows("resumes", userId);
  await deleteOwnedRows("user_ai_memory", userId);
  await deleteOwnedRows("user_model_credentials", userId);
  await deleteOwnedRows("user_voice_preferences", userId);
}

async function deleteOwnedRows(table: string, userId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from(table).delete().eq("user_id", userId);
  if (error && !isMissingSupabaseSchemaError(error)) throw error;
}
