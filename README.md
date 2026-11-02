# InsightLens AI

**Think Beyond the Scroll.** An editorial content-analysis and reflection workspace built with Next.js App Router, React, strict TypeScript, Tailwind, Radix/shadcn-style source components, Motion, Gemini through the AI SDK, and Supabase.

## Run locally

Requires Node.js 22.12+ (tested on Node 24) and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://127.0.0.1:3000. The explicitly labeled **sample demo** works immediately, without API keys or accounts. “Find the insight” is a real server endpoint and requires Gemini configuration. Live mode never silently substitutes sample results.

## Configure live AI

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey). Review the account's pricing, usage/data terms, and quota settings before enabling it.
2. In `.env.local`, set `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and `GEMINI_MODEL`. The example model is a currently documented economical stable model; verify that it is available to your account.
3. Restart the server. Submit 100–30,000 characters of permitted English text.
4. Live requests generate validated summaries, claims, three questions, and a next step. Reflection feedback uses a separate bounded request. All claims are **not independently verified** because this release has no evidence-retrieval integration.

## Configure Supabase

1. Create a Supabase project. Copy its project URL and **publishable** key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. Run [the migration](supabase/migrations/202611020001_initial.sql) in the SQL Editor, or link the Supabase CLI and run `supabase db push`.
3. Enable email/password authentication and email confirmation. Configure a transactional email provider appropriate to your pilot, including sender authorization. The built-in test email service has restrictions.
4. Set Auth → URL Configuration → Site URL to your app URL, and allow `http://127.0.0.1:3000/auth/callback` for local work and your exact deployed callback URL for production.
5. Add the **private server-only** `SUPABASE_SERVICE_ROLE_KEY` for account deletion and production quotas. Normal saved-data access always uses the user's session and RLS, never the admin client.
6. Create two test accounts, confirm email, save separate analyses, and run the opt-in RLS integration suite before a public launch. See [Testing](docs/TESTING.md).

## Check the project

```powershell
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests use deterministic API fixtures and the labeled sample. They do not consume Gemini quota. Optional two-user Supabase tests require a real project.

## Deploy to Vercel

1. Push this folder to a GitHub repository you own. No remote repository was assumed or created.
2. In Vercel, import that repository as a Next.js project. Use the repository root, `npm ci`, and `npm run build`. Use an eligible non-commercial Hobby account only if your use meets its terms.
3. Set the variables in `.env.example` for Preview and Production. Use HTTPS for `NEXT_PUBLIC_APP_URL` in deployment. Keep each environment's URL exact: it is used for same-origin checks and email callbacks.
4. Generate `RATE_LIMIT_SECRET` using `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and store it only as a Vercel secret environment value. The migration and private Supabase key are mandatory for production live AI. Production paid-provider calls fail closed outside Vercel or without the shared quota service.
5. Deploy a preview; add its exact URL to Supabase redirect URLs. Verify text analysis, reflection, sign-in, save/reload, deletion, and a two-user ownership test. Then promote only when authorized. No paid services or domains are required by the app itself; review provider billing independently.
6. Complete the operator/contact and provider-retention disclosures in Privacy and Terms before a public launch.

Detailed steps: [Deployment](docs/DEPLOYMENT.md).

## Implemented

- Responsive landing page and analysis workspace; text, transcript, and allowlisted article inputs.
- Server-only Gemini provider, structured Zod output, deadlines, one retry, bounded input, safe source excerpts, and honest unverified claims.
- Overview, main ideas, expandable Claim Compass, constructive reflection feedback, real interaction receipt, Markdown export, one next step.
- Focus Mode, Escape exit, outline, reading size/font/width/spacing/surface, persistent Light/Dark/System and four accent palettes.
- Supabase email sessions, explicit saving of guest sessions after sign-in, owner-scoped private library, search/filter/sort, dashboard from saved data, preference sync, analysis/data/account deletion.
- RLS migration, SSRF protection with DNS pinning, origin checks, private/no-store user APIs, distributed production quotas.

## Honest limits / remaining external work

- No live Gemini, email, database, RLS or deployed integration can be verified without your configured credentials/accounts. The code and deterministic tests do not establish those services are operational.
- Independent search/retrieval, persistent highlighting, OAuth, multilingual UI, PWA, PDF export, reminders, and knowledge graphs are not implemented. No verified evidence labels or fake citations are shown.
- URL extraction is best effort on six allowlisted hosts, not a 20-page certified extraction benchmark. Some pages block readers; pasted text is the reliable fallback. YouTube requires a supplied transcript.
- Library loads the most recent 200 records. Search/filter/sort apply to those loaded records. There is no pagination or semantic search yet.
- Guest session storage may be restored by a browser, and is not a secure storage vault. Closing the session removes its current tab copy. Browser preferences persist until cleared.
- Production quotas cap 5 analyses and 15 reflection requests per hashed IP per hour, and 100 total AI requests globally per hour. These bound request count, not exact currency spend; set provider billing/quotas too. No CAPTCHA is included.
- Server usage logs contain model and token counts only. Optional operator-supplied token rates enable estimated costs; provider billing remains authoritative.
- Focus on a shared device: sign out when finished, and close guest sessions. No optional cloud session autosave occurs; save changes explicitly.
- Sign-out and bulk deletion clear this tab's cached analyses. Reading preferences remain on the browser until cleared.
- Human grounding/quality benchmarks, real-user pilot validation, final operator legal review, and real-provider verification remain launch tasks. No IQ or attention improvement claims are made.

See [Architecture](docs/ARCHITECTURE.md), [Features](docs/FEATURES.md), [Database](docs/DATABASE.md), [AI pipeline](docs/AI_PIPELINE.md), [Design system](docs/DESIGN_SYSTEM.md), and [Testing](docs/TESTING.md).
