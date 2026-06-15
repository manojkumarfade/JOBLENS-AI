import { ResumeUploadCard } from "@/components/dashboard/ResumeUploadCard";

export default function ResumePage() {
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
