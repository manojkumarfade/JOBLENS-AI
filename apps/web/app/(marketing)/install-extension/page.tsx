import Image from "next/image";
import { ExtensionInstallSteps } from "@/components/marketing/ExtensionInstallSteps";
import { MarketingPage } from "@/components/marketing/MarketingShell";

export default function InstallExtensionPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="text-4xl font-semibold">Install the legacy private beta extension.</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              The current core product is the recruiter dashboard. The extension remains available for earlier browser-assisted job analysis workflows.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <Image src="/joblens-product-mockup.png" alt="JobLens Recruiter AI legacy extension preview" width={1400} height={900} className="h-auto w-full" />
          </div>
        </div>
        <div className="mt-12">
          <ExtensionInstallSteps />
        </div>
      </main>
    </MarketingPage>
  );
}
