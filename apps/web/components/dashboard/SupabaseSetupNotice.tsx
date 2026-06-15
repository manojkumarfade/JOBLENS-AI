import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupabaseSetupNotice({ detail }: { detail?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12">
        <Card className="w-full border-primary/30">
          <CardHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="h-6 w-6" />
            </div>
            <CardTitle>Supabase database setup needed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              JobLens is connected to Supabase, but the product tables are missing from that project. This is why the dashboard showed the raw `profiles` table error.
            </p>
            {detail ? <p className="rounded-md border bg-muted p-3 text-foreground">{detail}</p> : null}
            <p>
              Open Supabase SQL Editor and run `supabase/migrations/202606150001_initial_schema.sql`, then restart the dev server.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/install-extension">Back to public pages</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/supabase-setup">
                  Read setup guide <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
