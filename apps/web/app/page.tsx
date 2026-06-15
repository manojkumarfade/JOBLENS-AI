import { DashboardShowcase } from "@/components/marketing/DashboardShowcase";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { FeatureSection } from "@/components/marketing/FeatureSection";
import { FeatureTilesDark } from "@/components/marketing/FeatureTilesDark";
import { FinalCta } from "@/components/marketing/FinalCta";
import { HeroSection } from "@/components/marketing/HeroSection";
import { InsightsTeaser } from "@/components/marketing/InsightsTeaser";
import { JobMatchPreview } from "@/components/marketing/JobMatchPreview";
import { MarketingPage } from "@/components/marketing/MarketingShell";
import { PricingTable } from "@/components/marketing/PricingTable";
import { TestimonialSpotlight } from "@/components/marketing/TestimonialSpotlight";
import { ValuePillars } from "@/components/marketing/ValuePillars";

export default function HomePage() {
  return (
    <MarketingPage>
      <main>
        <HeroSection />
        <JobMatchPreview />
        <ValuePillars />
        <FeatureSection
          eyebrow="Role clarity"
          title="Know exactly what this role needs."
          body="JobLens turns dense job descriptions into clear responsibilities, requirements, and signals you can actually act on."
          bullet="No more rereading the same job post three times."
          art="requirements"
        />
        <FeatureSection
          eyebrow="Resume comparison"
          title="See where your resume already wins."
          body="Your active resume is compared against the role so strong evidence stands apart from weaker matches."
          bullet="No more guessing what preferred qualifications means."
          reverse
          art="matches"
        />
        <FeatureSection
          eyebrow="Truthful tailoring"
          title="Know what to fix before you apply."
          body="JobLens suggests grounded bullet improvements and flags when a suggestion would overreach your actual experience."
          bullet="No invented experience, just sharper evidence."
          art="bullets"
        />
        <FeatureTilesDark />
        <DashboardShowcase />
        <PricingTable />
        <TestimonialSpotlight />
        <FaqAccordion />
        <InsightsTeaser />
        <FinalCta />
      </main>
    </MarketingPage>
  );
}
