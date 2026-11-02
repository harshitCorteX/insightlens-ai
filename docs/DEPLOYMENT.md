# Deployment checklist and exact setup

## Local first

Run `npm ci`, copy `.env.example` to `.env.local`, and run `npm run dev`. Use `http://127.0.0.1:3000` consistently, including `NEXT_PUBLIC_APP_URL`; `localhost` is a different origin. The sample mode requires no services. Gemini live mode requires its three private configuration variables.

## Supabase

Create your own free-tier project if suitable. In its SQL Editor, execute the initial migration. Retrieve URL and publishable key from project settings, and the service-role key for the server environment only. Enable email/password and email confirmation in Auth. Set your Site URL and allowed `/auth/callback` redirect URLs. Configure SMTP before a multi-user pilot. Verify confirmation email delivery, login, save, refresh, and deletion with two accounts. No OAuth or bucket setup is needed.

## GitHub and Vercel

No remote is assumed. Create a repository in your intended GitHub account, set that remote, and push the project. Import it from Vercel with Next.js framework detection and the root directory. Use `npm ci` and `npm run build`. Node 24 matches the tested local runtime.

Configure each target's variables from `.env.example`. `NEXT_PUBLIC_APP_URL` must be the exact HTTPS deployment origin. For dynamic preview URLs, either assign a stable preview domain or update the variable and redeploy the target. Auth redirects must be allowlisted in Supabase. Do not configure a broad production callback wildcard.

Production live AI is deliberately unavailable unless all of these are true:

- Vercel's platform environment sets `VERCEL=1`.
- Private `RATE_LIMIT_SECRET` is present; generate 32 random bytes and keep it out of Git.
- Supabase URL and private service-role key exist.
- The quota RPC migration has been applied and is reachable.
- Gemini provider/key/model are configured.

The app relies on Vercel's platform-set client forwarding header for the IP budget. Do not run the production AI route behind a custom proxy with spoofable forwarded headers without replacing this trust boundary. Other hosts require an explicit trusted-proxy/quota adaptation rather than bypassing the production guard.

Use the free Vercel subdomain for launch. Check Hobby eligibility, provider billing and resource quotas; the application does not provision paid services or purchase anything. A global hourly budget limits request volume but is not exact spend protection.

The checked-in scripts use Next.js's supported webpack compiler. Vercel builds use the standard `.next` output directory; local builds use `.next-build`. The default Turbopack compiler failed to connect to its CSS subprocess on this Windows environment, and OneDrive marked its old `.next` output read-only. The alternate local directory is therefore kept out of Vercel's build path. Leave Vercel's Output Directory override disabled. No application or TypeScript validation is disabled.

## Preview gates

Run typecheck, deterministic tests, production build and Playwright tests. Then verify with real credentials: a live text request, real reflection feedback, supported URL/fallback, signup confirmation, login/logout, save/reload across browser sessions, two-user isolation, single/all data deletion and account deletion. Verify the production quota actually blocks over-budget calls. No test should call Gemini without explicit operator intent.

Before public access, complete Privacy/Terms operator identity/contact and provider data-use disclosures, review retention and backup settings, and perform human quality checks. The original PDF's 100-item accuracy benchmark, 20-page extraction benchmark, and 10-user pilot have not been claimed as passed.

Deployment status: no live URL is supplied unless an actual deployment is returned and verified. Preview deployment can proceed only once the intended remote/project and service configuration are available. Production promotion requires authorization.

Official references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs), [Vercel Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs).
