import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Circle, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Match Score", value: "92%", chip: "Up" },
  { label: "Skills Found", value: "8 / 10", chip: "Good" },
  { label: "Resume Ready", value: "Tailored", chip: "Done" }
];

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="space-y-7">
        <div className="inline-flex animate-fade-up items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-semibold opacity-0 [animation-delay:80ms]">
          <Circle className="h-2 w-2 fill-accent text-accent" />
          AI Job Copilot
        </div>
        <div className="space-y-5">
          <h1 className="animate-fade-up font-display text-5xl font-bold leading-[1.02] tracking-normal opacity-0 md:text-6xl [animation-delay:160ms]">
            Read less. Know more. Apply smarter.
          </h1>
          <p className="max-w-2xl animate-fade-up text-lg leading-8 text-muted-foreground opacity-0 [animation-delay:260ms]">
            JobLens reads the job page after you click, compares it against your real resume, and answers your questions out loud: summarize, match score, missing skills, tailored bullets.
          </p>
        </div>
        <div className="flex animate-fade-up flex-col gap-3 opacity-0 sm:flex-row [animation-delay:360ms]">
          <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/85">
            <Link href="/install-extension">
              Install the extension <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex animate-fade-up items-center gap-3 opacity-0 [animation-delay:460ms]">
          <div className="flex -space-x-2">
            {["AR", "MK", "JS"].map((item) => (
              <span key={item} className="grid h-9 w-9 place-items-center rounded-full border-2 border-background bg-muted text-xs font-bold">
                {item}
              </span>
            ))}
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">Used by job seekers preparing for their next role</p>
        </div>
      </div>
      <div className="animate-fade-up opacity-0 [animation-delay:560ms]">
        <div className="relative mx-auto max-w-md">
          <Image
            src="/generated/joblens-hero-portrait.png"
            alt="Young professional using JobLens at a laptop"
            width={1024}
            height={1536}
            priority
            className="aspect-[4/5] rounded-2xl object-cover shadow-[0_20px_60px_-30px_rgba(20,40,30,0.35)]"
          />
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:mt-0 sm:block sm:overflow-visible">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`min-w-44 rounded-2xl border bg-card p-4 shadow-[0_20px_60px_-30px_rgba(20,40,30,0.35)] sm:absolute sm:min-w-40 ${index === 0 ? "-left-10 top-16 -rotate-2 animate-float" : ""} ${index === 1 ? "-right-8 top-48 rotate-3 animate-float [animation-delay:700ms]" : ""} ${index === 2 ? "bottom-12 left-8 hidden -rotate-1 animate-float sm:block [animation-delay:1200ms]" : ""}`}
              >
                <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-display text-2xl font-bold">{stat.value}</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
                  <Mic className="h-3 w-3" /> {stat.chip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
