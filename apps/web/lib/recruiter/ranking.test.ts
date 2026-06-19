import { describe, expect, it } from "vitest";
import { analyzeJobDeterministic } from "./analysis";
import { demoCandidates, demoJob } from "./demoData";
import { activityScore, rankCandidates } from "./ranking";
import type { CandidateProfile } from "./types";

describe("recruiter ranking", () => {
  it("ranks the strongest full-stack AI candidate first", () => {
    const result = rankCandidates({ job: demoJob, candidates: demoCandidates });
    expect(result.rankedCandidates[0]?.candidate.name).toBe("Aarav Menon");
    expect(result.rankedCandidates[0]?.label).toBe("Excellent Fit");
    expect(result.rankedCandidates[0]?.overallScore).toBeGreaterThan(85);
  });

  it("penalizes missing must-have skills without auto-reject wording", () => {
    const structuredRequirements = analyzeJobDeterministic(demoJob);
    const mismatched: CandidateProfile = {
      id: "test-mismatch",
      name: "Mismatched Candidate",
      skills: ["tableau", "spreadsheet reporting"],
      projects: ["Built reporting dashboards for weekly operations metrics."],
      currentRole: "Operations Analyst",
      experienceYears: 2,
      resumeText: "Operations analyst with reporting and spreadsheet automation experience.",
      activitySignals: {
        profileCompleteness: 40,
        recentActivityScore: 35,
        assessmentScore: 35,
        responseSpeedScore: 35,
        applicationFreshness: 35,
        communicationScore: 35
      }
    };

    const result = rankCandidates({
      job: demoJob,
      structuredRequirements,
      candidates: [mismatched]
    });

    const ranked = result.rankedCandidates[0];
    expect(ranked.scoreBreakdown.mustHaveSkills).toBeLessThan(50);
    expect(ranked.scoreBreakdown.riskPenalty).toBeGreaterThan(10);
    expect(ranked.missingSignals.length).toBeGreaterThan(0);
    expect(`${ranked.explanation} ${ranked.recommendedAction}`.toLowerCase()).toContain("review");
  });

  it("includes activity signals in the score", () => {
    expect(
      activityScore({
        profileCompleteness: 95,
        recentActivityScore: 95,
        assessmentScore: 95,
        responseSpeedScore: 95,
        portfolioAvailable: true,
        githubAvailable: true,
        applicationFreshness: 95,
        communicationScore: 95
      })
    ).toBeGreaterThan(
      activityScore({
        profileCompleteness: 35,
        recentActivityScore: 35,
        assessmentScore: 35,
        responseSpeedScore: 35,
        portfolioAvailable: false,
        githubAvailable: false,
        applicationFreshness: 35,
        communicationScore: 35
      })
    );
  });

  it("works with deterministic job understanding fallback", () => {
    const result = rankCandidates({
      job: {
        title: "Senior Full Stack Developer",
        description: "Need React, Next.js, TypeScript, Node.js, Postgres and AI product experience with 5+ years."
      },
      candidates: demoCandidates.slice(0, 3)
    });

    expect(result.jobUnderstanding.mustHaveSkills).toContain("react");
    expect(result.rankedCandidates).toHaveLength(3);
    expect(result.fairnessNote).toContain("decision support");
  });
});
