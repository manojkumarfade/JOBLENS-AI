export function isMissingSupabaseSchemaError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return (
    candidate.code === "PGRST205" ||
    (typeof candidate.message === "string" && candidate.message.includes("Could not find the table"))
  );
}

export function supabaseSetupMessage() {
  return "Supabase tables are not created yet. Apply the migrations in docs/SUPABASE_SETUP.md, including the profile roles and recruiter ranking migrations, then restart the app.";
}
