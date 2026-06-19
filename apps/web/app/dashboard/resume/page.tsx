import { redirect } from "next/navigation";
import { ResumeUploadCard } from "@/components/dashboard/ResumeUploadCard";
import { getRoleForUser } from "@/lib/auth/roles";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function ResumePage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const role = await getRoleForUser(user.id);
  if (role !== "candidate") redirect("/dashboard/recruiter");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Resume</h1>
        <p className="mt-2 text-muted-foreground">Upload PDF, DOCX, or text resumes. One resume can be active at a time.</p>
      </div>
      <ResumeUploadCard />
    </div>
  );
}
