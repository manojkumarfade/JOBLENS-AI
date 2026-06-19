export function isMissingSupabaseSchemaError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return (
    candidate.code === "PGRST205" ||
    (typeof candidate.message === "string" && candidate.message.includes("Could not find the table"))
  );
}

export function supabaseSetupMessage() {
  return "Supabase tables are not created yet. Apply supabase/migrations/202606150001_initial_schema.sql and supabase/migrations/202606190001_recruiter_ranking.sql in the Supabase SQL Editor, then restart the app.";
}
