# JobLens AI Browser Copilot

JobLens AI Browser Copilot is a voice-first AI assistant for summarizing any webpage, explaining page content, and analyzing job pages against a user's active resume. It also includes a recruiter module for AI-powered candidate ranking and explainable shortlisting.

Production web app:

```text
https://joblenswithai.vercel.app
```

## Product Overview

- General users use the Chrome extension to summarize or explain any webpage by voice.
- Candidates upload a personal resume and ask job-fit questions on job boards.
- Recruiters use the Recruiter AI module to enter job descriptions, compare candidate profiles, and generate ranked shortlists.

The product uses one Supabase Auth system. Users choose a role during onboarding:

- `candidate`: default role for browser copilot, personal resume, and job-fit analysis
- `recruiter`: routes to recruiter ranking, jobs, candidate pools, and shortlisting tools

Current role separation is strict in the app UI and protected APIs: candidate accounts use personal resume and Browser Copilot features, while recruiter accounts use recruiter candidate pool/ranking features.

## Apps And Packages

- `apps/web`: Next.js app, auth, onboarding, candidate dashboard, recruiter dashboard, API routes, Supabase integration
- `apps/extension`: Chrome Manifest V3 extension with Web Speech voice input, transparent live transcription, DOM extraction after click, and browser TTS output
- `packages/shared`: shared TypeScript schemas, types, model catalog, and voice preferences
- `supabase`: migrations, RLS policies, and setup references

## Core Browser Copilot Flow

1. Sign in with the shared web auth system.
2. Open `/dashboard/candidate`.
3. Install or load the Chrome extension.
4. Open the extension popup and click **Sign in with dashboard Google account**.
5. Open any normal webpage.
6. Click the floating JobLens voice button.
7. Ask: "Summarize this page", "Explain this page", or "What are the key points?"
8. The extension extracts visible page text only after the click, sends the question and page context to the backend, and speaks the answer with browser speechSynthesis.

Temporary live transcription stays in extension React state and is not stored by default.

## Candidate Resume Flow

1. Open `/dashboard/candidate/resume`.
2. Upload a PDF, DOCX, or text resume.
3. The existing resume parser extracts text and metadata.
4. Mark one resume active.
5. On a job page, ask: "Am I fit for this job?" or "What skills am I missing?"

General webpage summaries do not require a resume. If a user asks for job-fit analysis without an active resume, the assistant asks them to upload one first.

Personal candidate resumes are separate from recruiter candidate pools.

## Recruiter AI Module

Open `/dashboard/recruiter`.

Recruiter flow:

1. Enter or use the seeded Senior Full Stack Developer / AI Product Engineer job.
2. Analyze the job to extract structured requirements.
3. Use seeded demo candidates, add a candidate manually, or upload a PDF/DOCX/text resume.
4. Rank candidates.
5. Review the shortlist table, score breakdown, matched evidence, gaps, concerns, recommended next step, and interview questions.
6. Copy the shortlist summary for human review.

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

AI is used when available for nuanced job understanding, explanation quality, concerns, recommended actions, and interview questions. If the model provider or key is unavailable, recruiter ranking falls back to deterministic extraction and ranking.

## API Routes

- `POST /api/voice/web-speech/ask`: voice/page assistant for general webpages, job pages, and recruiter pages. Requires auth, defaults `persistTranscript` to `false`, and returns a voice-friendly answer.
- `POST /api/recruiter/jobs/analyze`: analyzes a recruiter job description and persists a `jobs` row when the recruiter tables exist.
- `POST /api/recruiter/candidates/parse`: parses manual candidate data or uploaded PDF/DOCX/text resumes into recruiter candidate profiles.
- `POST /api/recruiter/rank`: ranks recruiter candidates, optionally enhances explanations with AI, and persists rankings when possible.
- `POST /api/extension-connect`: connects the Chrome extension to the current signed-in candidate account and issues the extension token.

Legacy routes for resume upload, saved analyses, settings, billing, and extension auth remain available to avoid breaking the existing deployed app.

## Database

Apply migrations in order:

```text
supabase/migrations/202606150001_initial_schema.sql
supabase/migrations/202606160001_remove_livekit_gemini.sql
supabase/migrations/202606160002_user_features.sql
supabase/migrations/202606190001_recruiter_ranking.sql
supabase/migrations/202606200001_profile_roles.sql
supabase/migrations/202606200002_role_billing_extension_links.sql
supabase/migrations/202606200003_extension_auto_connect_typegpt_cleanup.sql
```

Important tables:

- `profiles`: account profile and `user_role`
- `resumes`: personal candidate/general user resumes
- `jobs`, `candidates`, `candidate_rankings`: recruiter module data
- `user_extension_links`: candidate-owned Chrome extension connection records
- `voice_sessions`, `voice_transcripts`, `page_contexts`: saved voice/history data, used only when persistence is requested

RLS policies keep authenticated users scoped to their own rows.

Seed files do not create demo resumes or demo emails in the database. Recruiter demo candidates are local fallback data inside the recruiter workspace so evaluators can test ranking before persistence tables are applied.

## Security, Privacy, And Fairness

- Do not expose Supabase service role keys, model keys, Razorpay secrets, extension auth secrets, encryption keys, or `.env` values.
- Page content is sent to the backend only after the user clicks the extension voice button.
- Temporary live transcription is not stored by default.
- The assistant treats webpage DOM text as untrusted input.
- Recruiter ranking does not use protected attributes and should not infer gender, religion, caste, race, age, disability, marital status, photo, or similar sensitive categories.
- The tool does not automatically reject candidates.
- Hiring-related outputs are decision-support only. Human review is required.

## Local Development

```powershell
npm install
npm run dev:web
```

Open:

```text
http://localhost:3000/dashboard/candidate
http://localhost:3000/dashboard/recruiter
```

For extension builds against production:

```powershell
$env:VITE_JOBLENS_API_BASE_URL="https://joblenswithai.vercel.app"
npm run build:extension
```

Load `apps/extension/dist` from `chrome://extensions` with Developer mode enabled.

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

- This is a proof of concept, not an ATS replacement or a final hiring decision system.
- Browser speech recognition depends on Chrome/Edge Web Speech support and site-level microphone permission.
- The unpacked Chrome extension connects from the popup using the current signed-in candidate dashboard account.
- Demo recruiter activity signals are synthetic.
- AI model calls require a configured TypeGPT-compatible provider or platform key.
- Ranking persistence requires the recruiter Supabase migration to be applied.
- Temporary transcripts are not stored by default, so unsaved voice sessions do not appear in history.

## Future Improvements

- Extension store packaging and install detection improvements
- Saved browser copilot history with explicit opt-in
- Stronger resume parsing with section confidence
- Bulk recruiter candidate import and CSV export
- Configurable recruiter scoring weights per job
- Evaluation harness for ranking quality and voice-answer quality
- Admin/audit logs for hiring workflow governance
