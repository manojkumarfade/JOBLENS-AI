<<<<<<< HEAD
# JobLens Voice

JobLens Voice is a voice-first AI career copilot built as a monorepo:

- `apps/web`: Next.js web app and backend route handlers
- `apps/extension`: Chrome Manifest V3 extension
- `apps/agent`: Python LiveKit + Gemini Live agent worker
- `packages/shared`: shared TypeScript types, schemas, and model catalog
- `supabase`: database migrations, policies, and seed data

The five implementation specs in `D:\Joblens Voice Assistant\MD FIles` are the product contract for this codebase.

## Local Development

1. Run `npm install`.
2. Fill `apps/web/.env.local` with Supabase, platform model keys, LiveKit, Razorpay, and Resend settings.
3. Apply Supabase migrations from `supabase/migrations`.
4. Start the web app with `npm run dev:web`.
5. Build the extension with `npm run build:extension` and load `apps/extension/dist` as an unpacked Chrome extension.
6. Start the agent with `cd apps/agent && python agent.py dev`.

Secrets are server-only. The extension never stores model API keys, LiveKit secrets, or Gemini keys.
=======
# Hireready-AI
HireReady AI is an AI-assisted fresher hiring platform for recruiters, training institutes, and engineering graduates.
>>>>>>> d0f841db9d1c06e459a57ddc57fb7ae4dffc4578
