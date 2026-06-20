import { redirect } from "next/navigation";
import { ExtensionConnectClient } from "@/components/extension/ExtensionConnectClient";
import { MarketingPage } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleForUser } from "@/lib/auth/roles";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { isValidExtensionId } from "@/lib/data/extensionLinks";

export default async function ExtensionConnectPage({ searchParams }: { searchParams: Promise<{ extensionId?: string }> }) {
  const params = await searchParams;
  const extensionId = params.extensionId ?? "";

  if (!isValidExtensionId(extensionId)) {
    return (
      <MarketingPage showVoiceDemo={false}>
        <main className="mx-auto max-w-6xl px-4 py-16">
          <Card className="mx-auto w-full max-w-lg">
            <CardHeader>
              <CardTitle>Invalid extension request</CardTitle>
              <CardDescription>Open this page from the JobLens extension popup.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild><a href="/dashboard/candidate/extension">Open extension setup</a></Button>
            </CardContent>
          </Card>
        </main>
      </MarketingPage>
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/extension/connect?extensionId=${extensionId}`)}`);
  }

  const role = await getRoleForUser(user.id);
  if (role !== "candidate") {
    return (
      <MarketingPage showVoiceDemo={false}>
        <main className="mx-auto max-w-6xl px-4 py-16">
          <Card className="mx-auto w-full max-w-lg">
            <CardHeader>
              <CardTitle>Browser Copilot is for candidate accounts</CardTitle>
              <CardDescription>Recruiter accounts cannot connect the Chrome voice extension.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Switch your role to candidate/general user in settings if you want to use webpage voice summarization.</p>
              <Button asChild><a href="/dashboard/recruiter">Open recruiter dashboard</a></Button>
            </CardContent>
          </Card>
        </main>
      </MarketingPage>
    );
  }

  return (
    <MarketingPage showVoiceDemo={false}>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <ExtensionConnectClient extensionId={extensionId} userEmail={user.email} />
      </main>
    </MarketingPage>
  );
}
