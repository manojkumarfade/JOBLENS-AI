import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mic, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Badge variant="secondary">Private beta</Badge>
        <div className="space-y-4">
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
            JobLens Voice
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Voice-first job analysis, resume matching, truthful tailoring suggestions, and follow-up Q&A from any job page.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/install-extension">
              Install the extension <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Keys stay server-side and encrypted.
          </p>
          <p className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" /> Web Speech fallback works free.
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="overflow-hidden rounded-lg border bg-card shadow-xl">
          <Image
            src="/joblens-product-mockup.png"
            alt="JobLens Voice floating assistant on a job page"
            width={1400}
            height={900}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
