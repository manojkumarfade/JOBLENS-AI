"use client";

import { useEffect, useRef, useState } from "react";
import { AnalysisCard, type AnalysisView } from "@/components/dashboard/AnalysisCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 10;

export function AnalysesClient() {
  const [analyses, setAnalyses] = useState<AnalysisView[]>([]);
  const [selected, setSelected] = useState<AnalysisView | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  async function loadMore(offset = nextOffset) {
    if (offset === null || loading) return;
    setLoading(true);
    const res = await fetch(`/api/analyses?limit=${PAGE_SIZE}&offset=${offset}`);
    if (res.ok) {
      const data = await res.json();
      setAnalyses((current) => {
        const existing = new Set(current.map((item) => item.id));
        const incoming = (data.analyses ?? []).filter((item: AnalysisView) => !existing.has(item.id));
        const next = [...current, ...incoming];
        if (!selected && next[0]) setSelected(next[0]);
        return next;
      });
      setNextOffset(data.nextOffset ?? null);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadMore(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadMore();
    });
    observer.observe(target);
    return () => observer.disconnect();
  });

  async function remove(id: string) {
    await fetch(`/api/analyses/${id}`, { method: "DELETE" });
    setAnalyses((current) => current.filter((analysis) => analysis.id !== id));
    setSelected((current) => (current?.id === id ? null : current));
  }

  if (!loading && analyses.length === 0) {
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
        <div ref={sentinelRef} className="h-10 rounded-md border bg-muted/40 text-center text-sm leading-10 text-muted-foreground">
          {loading ? "Loading..." : nextOffset === null ? "All analyses loaded" : "Scroll for more"}
        </div>
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
      ) : (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Select an analysis to view details.</CardContent></Card>
      )}
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
