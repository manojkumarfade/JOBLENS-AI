# JobLens Voice

**Status: Partially Completed** — Core functionality is working and deployed. See [Working Features](#working-features) below.

JobLens Voice is a voice-first AI career copilot. It lives as a Chrome extension that you open on any job listing page — click a button and talk to an AI that understands the job, knows your resume, and can answer questions, compare fit, and suggest improvements.

Built as a monorepo:

- `apps/web`: Next.js web app and backend route handlers
- `apps/extension`: Chrome Manifest V3 extension
- `packages/shared`: shared TypeScript types and schemas
- `supabase`: database migrations, policies, and seed data

> **Note:** The Python LiveKit/Gemini agent (`apps/agent`) has been removed. Voice runs entirely via the Web Speech API in the browser, powered by TypeGPT on the server.

Production web app:

```text
https://joblenswithai.vercel.app
```

## Working Features

| Feature | Description |
|---------|-------------|
| **Voice Conversation on Any Job Page** | Click the extension's floating button, speak naturally — the AI reads the job listing, compares it to your resume, and answers questions. Continuous listen-think-speak loop with barge-in. |
| **Smart Job Page Extraction** | 16 job-site-specific DOM selectors (LinkedIn, Indeed, etc.) with confidence scoring and noise removal. |
| **Job Analysis** | Full structured analysis: job summary, required skills, responsibilities, qualifications, experience level, salary insights. |
| **Resume Comparison** | AI compares your uploaded resume against the job listing — match score, matched/missing skills, experience gap analysis, action recommendations. |
| **Resume Tailoring** | Truthful AI-generated suggestions for tailoring your resume to the job. |
| **Resume Management** | Upload PDF/DOCX/text, auto-parse (skills, projects, experience), store in Supabase, mark active. |
| **AI Memory** | Persistent user-provided context injected into every AI prompt. |
| **Authentication** | Email/password + Google OAuth via Supabase; session management with SSR cookies. |
| **Extension Login** | Seamless OAuth flow from extension popup → web login → signed JWT token handoff to extension via `chrome.runtime.sendMessage`. |
| **Dashboard** | Full web dashboard: analyses list, resume management, billing, profile/settings, voice preferences. |
| **Voice Settings** | Choose AI model (TypeGPT variants), bring your own API key (BYOK — encrypted at rest with AES-256-GCM), voice style presets (Natural/Crisp/Calm). |
| **BYOK (Bring Your Own Key)** | Encrypt and save your own TypeGPT API key; test before saving; credential status reporting. |
| **Razorpay Billing** | Pro subscription with monthly/yearly plans, INR pricing, Razorpay order creation + signature verification + webhook + customer portal. |
| **Quota System** | Free tier: 15 analyses/month. Pro: 200/month. BYOK: unlimited. |
| **Data Privacy Controls** | Delete all data or full account deletion with cascade cleanup. |
| **Marketing Landing Page** | 13-section responsive page with custom Sora/Jakarta Sans fonts, theme, animations. |
| **Pricing Page** | Pro plan with yearly/monthly toggle, feature comparison table. |
| **Security** | Input sanitization (XSS/injection), AES-256-GCM encryption, JWT-based extension tokens, prompt injection guards. |
| **TypeScript Throughout** | Shared Zod schemas validated on both client and server; full type safety across the monorepo. |

### Not Yet Completed / Known Gaps

- **Transactional emails** — Resend helper is written but not yet wired to any trigger (e.g. welcome email, subscription confirmation).
- **Analyses detail page** — No dedicated single-analysis view (list with cards on dashboard only).
- **Tests** — Only a few tests exist (`modeResolver`, `modelCatalog`, `encryption`). No extension or component tests.
- **Loading states** — Some dashboard pages lack `loading.tsx` skeletons.
- **Error boundary** — No custom `not-found.tsx` or `error.tsx` pages.
- **Extension tests** — Only `modeResolver.test.ts` exists.

## Local Development

```powershell
npm install
npm run dev:web
```

Build and load the extension for local development:

```powershell
npm run build:extension
```

Then open `chrome://extensions`, enable Developer mode, and load `apps/extension/dist` as an unpacked extension.

## Production Extension Build

Build the extension against the deployed Vercel backend:

```powershell
$env:VITE_JOBLENS_API_BASE_URL="https://joblenswithai.vercel.app"
npm run build:extension
```

Then load `apps/extension/dist` as the unpacked extension. The popup sign-in flow will open `https://joblenswithai.vercel.app/login?from=extension`.

## Vercel Web Deployment

The web app deploys independently to Vercel. Configure:

```text
NEXT_PUBLIC_APP_URL=https://joblenswithai.vercel.app
```

Keep Supabase service role, TypeGPT keys, Razorpay secrets, Resend key, encryption key, and extension auth secret server-only.

Recommended verification:

```powershell
npm install
$env:NEXT_PUBLIC_APP_URL="https://joblenswithai.vercel.app"; npm run build:web
$env:VITE_JOBLENS_API_BASE_URL="https://joblenswithai.vercel.app"; npm run build:extension
npm run typecheck
npm run test
```

Secrets are never stored in the extension. Page DOM is read only after the signed-in user clicks the floating voice button.
