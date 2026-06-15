import { CheckCircle2, FileSearch, Mic2, Save, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { title: "Job summaries", icon: FileSearch, text: "Extract role scope, requirements, location, and salary hints from the page." },
  { title: "Resume matching", icon: Target, text: "Compare the job with evidence from the active resume." },
  { title: "Missing skills", icon: CheckCircle2, text: "Separate strong matches from gaps without inflating experience." },
  { title: "Truthful tailoring", icon: Sparkles, text: "Improve resume bullets only when backed by the user's background." },
  { title: "Voice Q&A", icon: Mic2, text: "Ask follow-up questions through Fast & Free or Natural Call Voice." },
  { title: "Save and track", icon: Save, text: "Keep analyses and return to them from the dashboard." }
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-3xl font-semibold">Everything needed to inspect a role quickly.</h2>
        <p className="mt-3 text-muted-foreground">Built for careful decisions, not inflated resumes or one-click applying.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
