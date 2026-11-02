# Verification record

Local verification performed 2 November 2026 on Windows, Node 24.19.0, Next.js 16.4.3, React 19.3.1, AI SDK 7.0.159, strict TypeScript 7.0.2.

## Observed checks

- `npm run typecheck`: passed.
- `npm test`: 59 deterministic tests passed; the optional real Supabase two-user RLS test skipped because no credentials were configured.
- `npm run build`: passed using the supported webpack compiler. All required pages and API routes compiled, with 21 static pages generated.
- Dependency manifest and lockfile: exact pinned versions match.
- `npm run test:e2e`: 9 browser tests passed in 42.1 seconds; 1 intentionally skipped duplicate viewport sweep in the mobile project. No failed tests remained.
- Axe: no reported WCAG A/AA violations on landing, analysis input and settings in both themes at desktop/mobile sizes, or on the tested focused reading surface. This is not a full accessibility certification.
- Layout sweep: no document overflow at 375, 430, 768, 1024, 1280 or 1440px on the tested pages.
- Visual inspection: desktop landing/expanded Claim Compass and mobile dark Focus Mode screenshots reviewed. Test-owned local servers were shut down after verification.

The default Turbopack compiler failed in this Windows environment while launching its CSS subprocess. No TypeScript or build validation was disabled. The project uses webpack and a fresh `.next-build` output path to avoid the read-only old OneDrive cache.

## Flow evidence

| Boundary | Verification |
| --- | --- |
| UI → analysis API | Browser submits valid source text and displays a complete deterministic response; validation and error paths tested in route tests |
| Analysis API → provider | Current installed SDK API types/docs checked; mocked success/failure and schema validation tested; real Gemini not configured |
| Source extraction | Private DNS, redirect, public-IP pinning, download cap, HTML parsing and transcript fallback tested |
| Result → reflection/receipt | Real browser interactions preserve answers across Focus Mode, preferences, sections and reload; receipt counts actual opened cards/answers; Markdown download tested |
| Account UI → saved library | Deterministic service fixtures exercise saving, revisiting and deletion at desktop/mobile sizes |
| API → ownership filtering | Server-derived owner, read/save/delete filters, reflection persistence and anonymous rejection tested with a deterministic DB adapter |
| Deployed Supabase RLS | Migration supplied; real-project test supplied but not run without credentials |
| Themes/accessibility/layout | Light/dark screens audited with axe, keyboard interactions exercised, six viewport widths checked; actual screenshots visually inspected |

## External prerequisites not verified

No `.env.local` was present during implementation. Real Gemini analysis/feedback, Supabase signup email delivery/session/callback, migration execution, deployed RLS, production quota RPC and account deletion need the owner's configuration. No matching InsightLens GitHub repository or Vercel project was found in connected accounts. No repository remote, preview deployment or production URL was assumed or created.

Independent evidence retrieval is not implemented; every claim stays unverified. Human accuracy benchmarks, broad URL-source extraction benchmarks, manual screen-reader testing, Lighthouse scores, provider billing limits and a real-user pilot are not claimed as passed.

The code is prepared for deployment; public launch still requires service configuration, live checks, operator/contact disclosures and an intended repository/project.
