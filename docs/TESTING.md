# Tests and verification

## Reproduce

```powershell
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts `npm run start` against the production build on `http://127.0.0.1:3000`, then tears down its owned server. Stop any unrelated service on that port, or intentionally reuse the same built application. No test should need Gemini credentials or consume paid-provider quota.

## Deterministic coverage

- Input bounds, HTTPS URL shape, structured analysis completeness, distinct question skills, claim categories, normalization, ownership helpers and safe internal redirects.
- Analysis API success and invalid input, quota denial, provider outage, URL extraction failure; reflection validation, feedback shape and failure.
- Save/retrieve reflections and claim feedback, server-derived ownership, cross-user read/delete filters, anonymous rejection and bulk deletion using a deterministic database adapter.
- SSRF address classes, explicit host allowlist, private DNS resolution, redirect validation, pinned socket lookup, HTML extraction without script execution and download size limits.
- Same-origin mutations, streaming body bounds, malformed JSON, local quota expiry, production fail-closed controls, hashed quota subjects and backend failures.
- Provider schema rejection, removal of invented source excerpts, missing configuration and token/cost metadata.

Mocks verify application behavior and request contracts. They are not proof of deployed RLS, real email delivery, model quality or live provider availability.

## Browser suite

Chromium desktop (1440px) and mobile (375px): landing → labeled sample → claims → reflection → Focus Mode → preferences → themes → receipt → Markdown export → refresh persistence → next step → sign-in handoff. Deterministic network fixtures separately cover submitted-content rendering, error recovery, signed-in library save/revisit/delete. Every required route is visited. Browser runtime errors are captured in the main journey.

The desktop-only sweep checks 375, 430, 768, 1024, 1280 and 1440px for document overflow on landing, analysis input and settings. It also exercises the focused outline and low-glare reading surface. The same sweep is intentionally skipped in the mobile project to avoid duplicate work.

Axe WCAG A/AA checks run on landing, analysis input and settings in light and dark themes at both primary viewports, plus the focused reading surface. This is an automated check, not a complete accessibility certification. Keyboard skip navigation, Escape exit, dialog controls and answer preservation are explicitly exercised. Screenshots and retained failure traces are in ignored `test-results/` and `playwright-report/`.

Visual QA inspects actual rendered screenshots, including the desktop claims view and mobile dark Focus Mode. Observed secondary-text contrast problems were corrected at the token level. Text does not fade during input transitions, avoiding transient contrast failures. Fonts are bundled locally.

## Optional real Supabase isolation test

Use an isolated project with the migration applied and two confirmed users. Set these variables privately in your shell/CI secrets (never commit credentials):

```text
SUPABASE_TEST_URL
SUPABASE_TEST_PUBLISHABLE_KEY
SUPABASE_TEST_USER_A_EMAIL
SUPABASE_TEST_USER_A_PASSWORD
SUPABASE_TEST_USER_B_EMAIL
SUPABASE_TEST_USER_B_PASSWORD
```

Then run `npm test`. The opt-in suite signs in both users, inserts an original sample under user A, checks B cannot read/update/delete it or forge A's ownership, and cleans up the created record in a finally block. It does not delete accounts. Without all six variables the test is reported as skipped.

## External release checks

Real Gemini analysis/feedback, Supabase email/password confirmation and callback, actual migration/RLS, distributed production quota enforcement, actual account deletion and a deployed HTTPS URL require configured external services. Human grounded-fact evaluation, adversarial prompt-quality review, the PDF's larger extraction benchmark and a real-user pilot are not established by deterministic tests. Do not describe those as passed.

Latest observed results are recorded in `docs/VERIFICATION.md` after final checks.
