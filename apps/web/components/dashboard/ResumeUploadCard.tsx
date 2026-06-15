"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ResumeView {
  id: string;
  original_filename: string;
  parsed_text?: string | null;
  skills?: string[];
  experience_level?: string | null;
  is_active: boolean;
}

export function ResumeUploadCard() {
  const [resumes, setResumes] = useState<ResumeView[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/resumes");
    if (res.ok) setResumes((await res.json()).resumes);
    setLoading(false);
  }

  useEffect(() => {
    // Initial client-side fetch after auth-protected dashboard render.
    void load();
  }, []);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Parsing your resume...");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/upload-resume", { method: "POST", body: form });
    const data = await res.json();
    setMessage(res.ok ? "Resume parsed and saved." : data.error?.message ?? "Upload failed.");
    if (res.ok) await load();
  }

  async function setActive(id: string) {
    const res = await fetch(`/api/resumes/${id}/active`, { method: "POST" });
    setMessage(res.ok ? "Active resume updated." : "Could not update active resume.");
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Upload resume</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={upload} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input name="file" type="file" accept=".pdf,.docx,.txt" required />
            <Button type="submit"><Upload className="h-4 w-4" /> Upload</Button>
          </form>
          {message ? <p className="mt-4 rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
        </CardContent>
      </Card>
      {loading ? (
        <Skeleton className="h-40" />
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">No resume uploaded yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{resume.original_filename}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Experience level: {resume.experience_level ?? "unknown"}</p>
                </div>
                {resume.is_active ? <Badge>Active</Badge> : <Button variant="outline" onClick={() => setActive(resume.id)}>Make active</Button>}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(resume.skills ?? []).map((skill: string) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{String(resume.parsed_text ?? "").slice(0, 400)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
