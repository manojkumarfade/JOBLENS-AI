"use client";

import { useEffect, useState } from "react";
import { AnalysisCard, type AnalysisView } from "@/components/dashboard/AnalysisCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalysesClient() {
  const [analyses, setAnalyses] = useState<AnalysisView[]>([]);
  const [selected, setSelected] = useState<AnalysisView | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/analyses");
    if (res.ok) {
      const data = await res.json();
      setAnalyses(data.analyses);
      setSelected((current) => current ?? data.analyses[0] ?? null);
    }
    setLoading(false);
  }

  useEffect(() => {
    // Initial client-side fetch after auth-protected dashboard render.
    void load();
  }, []);

  async function remove(id: string) {
    await fetch(`/api/analyses/${id}`, { method: "DELETE" });
    setSelected(null);
    await load();
  }

  if (loading) return <Skeleton className="h-64" />;
  if (analyses.length === 0) {
    return <Card><CardContent className="p-8 text-center text-muted-foreground">No saved analyses yet - open a job page and ask JobLens to save it.</CardContent></Card>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <button key={analysis.id} className="block w-full text-left" onClick={() => setSelected(analysis)}>
            <AnalysisCard analysis={analysis} />
          </button>
        ))}
      </div>
      {selected ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{selected.roleTitle ?? "Untitled role"}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{selected.companyName ?? "Unknown company"}</p>
            </div>
            <Button variant="destructive" onClick={() => remove(selected.id)}>Delete</Button>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-6">
            <p>{selected.summary}</p>
            <Section title="Strong matches" items={selected.strongMatches} />
            <Section title="Missing skills" items={selected.missingSkills} />
            <Section title="Recommended actions" items={selected.recommendedActions} />
            <Section title="Tailored bullets" items={selected.tailoredBullets} />
            <p className="rounded-md border bg-muted p-3 text-muted-foreground">Truthful suggestions only. Verify every bullet before using it in an application.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Section({ title, items = [] }: { title: string; items?: string[] }) {
  return (
    <section>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 list-inside list-disc text-muted-foreground">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No items saved.</li>}
      </ul>
    </section>
  );
}
