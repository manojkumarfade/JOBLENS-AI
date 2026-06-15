# JobLens Voice

JobLens Voice is a voice-first AI career copilot built as a monorepo:

- `apps/web`: Next.js web app and backend route handlers
- `apps/extension`: Chrome Manifest V3 extension
- `apps/agent`: Python LiveKit + Gemini Live agent worker
- `packages/shared`: shared TypeScript types and schemas
- `supabase`: database migrations, policies, and seed data

Production web app:

```text
https://joblenswithai.vercel.app
```

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

Keep Supabase service role, LiveKit secrets, Gemini/TypeGPT keys, Razorpay secrets, Resend key, encryption key, extension auth secret, and agent secret server-only.

Recommended verification:

```powershell
npm install
$env:NEXT_PUBLIC_APP_URL="https://joblenswithai.vercel.app"; npm run build:web
$env:VITE_JOBLENS_API_BASE_URL="https://joblenswithai.vercel.app"; npm run build:extension
npm run typecheck
npm run test
```

## LiveKit Agent

The Python LiveKit/Gemini agent is not deployed inside Vercel. Run it as a separate worker locally, on LiveKit Cloud, or another worker host.

Required worker env names:

```text
JOBLENS_API_BASE_URL=https://joblenswithai.vercel.app
JOBLENS_AGENT_SECRET
LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
GOOGLE_API_KEY
GEMINI_LIVE_MODEL
```

Local agent check:

```powershell
cd apps/agent
python -m pytest
```

Secrets are never stored in the extension. Page DOM is read only after the signed-in user clicks the floating voice button.
