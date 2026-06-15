import { createSupabaseServiceClient } from "../supabase/server";

export async function deleteAllUserData(userId: string) {
  const supabase = createSupabaseServiceClient();
  const { data: resumes } = await supabase.from("resumes").select("file_path").eq("user_id", userId);
  const paths = (resumes ?? []).map((row) => row.file_path).filter(Boolean);
  if (paths.length) await supabase.storage.from("resumes").remove(paths);

  await supabase.from("voice_transcripts").delete().eq("user_id", userId);
  await supabase.from("voice_sessions").delete().eq("user_id", userId);
  await supabase.from("job_analyses").delete().eq("user_id", userId);
  await supabase.from("page_contexts").delete().eq("user_id", userId);
  await supabase.from("resumes").delete().eq("user_id", userId);
  await supabase.from("user_model_credentials").delete().eq("user_id", userId);
  await supabase.from("user_voice_preferences").delete().eq("user_id", userId);
}
