import { MarketingPage } from "@/components/marketing/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupabaseSetupPage() {
  return (
    <MarketingPage showVoiceDemo={false}>
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold">Supabase setup</h1>
          <p className="mt-3 text-muted-foreground">
            Run the migrations before using auth, recruiter ranking persistence, resume parsing, and billing features.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Fix `PGRST205` missing table errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-6 text-muted-foreground">
            <p>Open Supabase Dashboard, go to SQL Editor, and run the full contents of these files in order:</p>
            <pre className="overflow-auto rounded-md border bg-muted p-3 text-foreground">
              D:\Joblens Voice Assistant\JOBLENS\supabase\migrations\202606150001_initial_schema.sql{"\n"}
              D:\Joblens Voice Assistant\JOBLENS\supabase\migrations\202606190001_recruiter_ranking.sql
            </pre>
            <p>After running the SQL, restart `npm run dev:web`. Supabase may take a moment to refresh its schema cache.</p>
            <p>For Google login, enable the Google provider in Supabase Auth and add `http://localhost:3000/auth/callback` to redirect URLs.</p>
          </CardContent>
        </Card>
      </main>
    </MarketingPage>
  );
}
