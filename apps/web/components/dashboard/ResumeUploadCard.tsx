"use client";

import { useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authFetch } from "@/lib/auth/clientFetch";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await authFetch("/api/resumes");
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
    const res = await authFetch("/api/upload-resume", { method: "POST", body: form });
    const data = await res.json();
    setMessage(res.ok ? "Resume parsed and saved." : data.error?.message ?? "Upload failed.");
    if (res.ok) await load();
  }

  async function setActive(id: string) {
    setActiveId(id);
    const res = await authFetch(`/api/resumes/${id}/active`, { method: "POST" });
    setMessage(res.ok ? "Active resume updated." : "Could not update active resume.");
    if (res.ok) await load();
    setActiveId(null);
  }

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume and its stored file?")) return;
    setDeletingId(id);
    const res = await authFetch(`/api/resumes/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setMessage(res.ok ? "Resume deleted." : data?.error?.message ?? "Could not delete resume.");
    if (res.ok) await load();
    setDeletingId(null);
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
                <div className="flex flex-wrap items-center gap-2">
                  {resume.is_active ? <Badge>Active</Badge> : <Button variant="outline" onClick={() => setActive(resume.id)} disabled={activeId === resume.id}>{activeId === resume.id ? "Updating..." : "Make active"}</Button>}
                  <Button variant="outline" onClick={() => deleteResume(resume.id)} disabled={deletingId === resume.id}>
                    <Trash2 className="h-4 w-4" /> {deletingId === resume.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
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
