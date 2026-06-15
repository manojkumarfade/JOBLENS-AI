import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { parseResumeFile } from "@/lib/resume/parser";
import { safeFilename } from "@/lib/security/sanitize";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to upload resumes.", 401);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return errorResponse("BAD_REQUEST", "A PDF, DOCX, or text resume file is required.", 400);
    const parsed = await parseResumeFile(file);
    const supabase = createSupabaseServiceClient();
    const path = `${user.id}/${crypto.randomUUID()}-${safeFilename(file.name)}`;

    const upload = await supabase.storage.from("resumes").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });
    if (upload.error) throw upload.error;

    await supabase.from("resumes").update({ is_active: false }).eq("user_id", user.id);
    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        file_path: path,
        original_filename: file.name,
        parsed_text: parsed.parsedText,
        skills: parsed.skills,
        projects: parsed.projects,
        experience_level: parsed.experienceLevel,
        is_active: true
      })
      .select("*")
      .single();
    if (error) throw error;

    return json({
      resumeId: data.id,
      parsed: true,
      skills: parsed.skills,
      experienceLevel: parsed.experienceLevel
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
