export function isMissingSupabaseSchemaError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return (
    candidate.code === "PGRST205" ||
    (typeof candidate.message === "string" && candidate.message.includes("Could not find the table"))
  );
}

export function isMissingSupabaseColumnError(error: unknown, column?: string) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message : "";
  return (
    candidate.code === "42703" ||
    candidate.code === "PGRST204" ||
    (column ? message.includes(column) : message.includes("column") || message.includes("schema cache"))
  );
}

export function supabaseSetupMessage() {
  return "Supabase tables are not created yet. Apply the migrations in docs/SUPABASE_SETUP.md, including the profile roles and recruiter ranking migrations, then restart the app.";
}
