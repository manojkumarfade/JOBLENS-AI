import { ResumeUploadCard } from "@/components/dashboard/ResumeUploadCard";

export default function CandidateResumePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Personal Resume</h1>
        <p className="mt-2 text-muted-foreground">
          Upload PDF, DOCX, or text resumes for your own job-fit voice analysis. This is separate from recruiter candidate pools.
        </p>
      </div>
      <ResumeUploadCard />
    </div>
  );
}
