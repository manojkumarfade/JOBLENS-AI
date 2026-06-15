import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobMatchPreview } from "./JobMatchPreview";

export function FinalCta() {
  return (
    <section className="overflow-hidden bg-panel-dark py-20 text-panel-dark-foreground">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent font-display font-bold text-accent-foreground">JL</p>
        <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-bold">Stop guessing if a job is right for you.</h2>
        <p className="mx-auto mt-4 max-w-xl text-panel-dark-muted">Open the role, click JobLens, and get a grounded read before you spend your energy applying.</p>
        <Button asChild className="mt-7 rounded-full bg-accent text-accent-foreground hover:bg-accent/85">
          <Link href="/install-extension">Get started</Link>
        </Button>
        <div className="mx-auto mt-10 max-w-4xl scale-95 text-left">
          <JobMatchPreview compact />
        </div>
        <p className="mt-12 font-display text-[clamp(4rem,16vw,13rem)] font-extrabold leading-none text-panel-dark-foreground/10">JOBLENS</p>
      </div>
    </section>
  );
}
