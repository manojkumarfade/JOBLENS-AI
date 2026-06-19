# JobLens Recruiter AI

JobLens Recruiter AI is an AI-powered candidate ranking and shortlisting proof of concept for recruiters and HR users.

It goes beyond keyword filtering: recruiters enter a job description, add or upload candidate profiles, and receive an explainable ranked shortlist based on job understanding, semantic relevance, must-have skills, experience, projects, career metadata, and activity signals.

Production web app:

```text
https://joblenswithai.vercel.app
```

## Project Overview

- `apps/web`: Next.js app, recruiter dashboard, API route handlers, Supabase integration
- `apps/extension`: legacy Chrome Manifest V3 extension kept working from the earlier product iteration
- `packages/shared`: shared TypeScript types and schemas
- `supabase`: migrations, RLS policies, and setup references

This POC focuses on candidate ranking and explainable shortlisting. Some legacy voice-related files may exist from earlier iterations but are not part of the current core evaluation path.

## Core Recruiter Flow

1. Open `/dashboard/recruiter`.
2. Enter or use the seeded Senior Full Stack Developer / AI Product Engineer job.
3. Analyze the job to extract structured requirements.
4. Use seeded demo candidates, add a candidate manually, or upload a PDF/DOCX/text resume.
5. Rank candidates.
6. Review the shortlist table, score breakdown, matched evidence, gaps, concerns, recommended next step, and interview questions.
7. Copy the shortlist summary for recruiter review.

## Ranking Algorithm

The deterministic ranking engine lives in `apps/web/lib/recruiter/ranking.ts`.

Score formula:

```text
overallScore =
semanticFit * 0.30 +
mustHaveScore * 0.25 +
experienceScore * 0.15 +
projectScore * 0.10 +
careerMetadataScore * 0.10 +
activityScore * 0.10 -
riskPenalty
```

Signals used:

- Semantic fit against the job description and structured requirements
- Must-have skill coverage
- Experience years and seniority alignment
- Project/domain evidence
- Career metadata such as role relevance, location, education, certifications, portfolio/GitHub indicators
- Activity signals such as profile completeness, recent activity, assessment score, response speed, freshness, and communication score
- Risk flags for missing critical evidence, low experience, weak activity, or unclear profile data

AI is used when available for nuanced job understanding, semantic explanation quality, concerns, recommended actions, and interview questions. If the model provider or key is unavailable, the app falls back to deterministic extraction and ranking.

## API Routes

- `POST /api/recruiter/jobs/analyze`: analyzes a recruiter job description and persists a `jobs` row when the recruiter tables exist.
- `POST /api/recruiter/candidates/parse`: parses manual candidate data or uploaded PDF/DOCX/text resumes into candidate profiles.
- `POST /api/recruiter/rank`: ranks candidates, optionally enhances explanations with AI, and persists rankings when possible.

Legacy routes for job analysis, resume upload, settings, billing, and extension auth remain available to avoid breaking the existing deployed app.

## Database

Apply migrations in order:

```text
supabase/migrations/202606150001_initial_schema.sql
supabase/migrations/202606160001_remove_livekit_gemini.sql
supabase/migrations/202606160002_user_features.sql
supabase/migrations/202606190001_recruiter_ranking.sql
```

Recruiter MVP tables:

- `jobs`
- `candidates`
- `candidate_rankings`

Each table has RLS enabled so authenticated users can only manage their own rows.

## Security And Fairness

- Do not expose Supabase service role keys, TypeGPT keys, Razorpay secrets, extension auth secrets, encryption keys, or `.env` values.
- Candidate ranking does not use protected attributes and should not infer gender, religion, caste, race, age, disability, marital status, photo, or any sensitive category.
- The tool does not automatically reject candidates.
- Explanations should be based only on candidate data and job criteria.
- The dashboard includes a visible human-review disclaimer.

## Local Development

```powershell
npm install
npm run dev:web
```

Open:

```text
http://localhost:3000/dashboard/recruiter
```

## Verification

```powershell
npm run typecheck
npm run test
npm run build:web
npm run build:extension
```

## Vercel Deployment

The web app deploys independently to Vercel. Configure:

```text
NEXT_PUBLIC_APP_URL=https://joblenswithai.vercel.app
```

Keep server-only secrets in Vercel environment variables and never ship them to the client or extension.

## Known Limitations

- This is a proof of concept, not an ATS replacement.
- Demo activity signals are synthetic.
- AI enhancements depend on the existing TypeGPT-compatible model route and configured credentials.
- Ranking persistence requires the recruiter Supabase migration to be applied.
- Legacy voice/extension files remain for compatibility but are not part of the core recruiter-ranking evaluation path.

## Future Improvements

- Bulk candidate import and CSV export
- Saved recruiter projects and ranking history views
- Stronger resume parsing with section confidence
- Configurable scoring weights per job
- Evaluation harness for ranking quality
- Admin/audit logs for hiring workflow governance
