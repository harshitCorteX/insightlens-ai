# Architecture

One Next.js application, deployed as Vercel Functions. React client components implement the interactive workspace; route handlers own all credentials, AI calls, authentication and persistence. No separate backend, queue, container, or storage bucket is needed.

```text
Browser -> same-origin Route Handler -> input validation + quota
  -> text normalization / safe article extraction -> Gemini structured output
  -> Zod + excerpt grounding -> transient tab session -> optional explicit save
                                      -> Supabase Auth + RLS-owned JSON aggregate
```

`src/lib/schema.ts` is the shared runtime/type contract. `src/lib/server/ai.ts` exposes an AnalysisProvider interface for future adapters. Never import server modules into clients. `server-only` protects boundaries.

`/api/auth` uses the supported Supabase SSR cookie adapter. The Next proxy refreshes sessions only on API/auth routes; private APIs use `getUser()` to validate identity and return no-store responses. The application shell gets a minimal user projection from `/api/auth`.

The analysis aggregate stores source, generated structured result and learning progress atomically. Claims have no model-controlled verification state. The UI's independent verification status is always unverified. Account-synced learning preferences are separate from theme mode, which stays in next-themes local storage.

Guest state uses versioned sessionStorage; preferences use versioned localStorage. Storage exceptions produce a useful fallback message rather than silently losing analysis. Focus Mode preserves the same React state and changes only the presentation. Reading controls are a Radix dialog with focus restoration; Focus Mode itself does not trap focus.

Security: request byte limits, schema validation, escaped React text, fixed source allowlist, public DNS validation + pinned socket resolution, redirect revalidation, same-origin mutations, no public service-role key, RLS and explicit owner filters. Production AI quotas are atomic in Postgres, with global and per-IP budgets, no raw IP storage, and no permissive fallback if quota infrastructure fails.

The CSP permits inline scripts required by Next and next-themes; scripts have no third-party origins. A nonce-based strict CSP is a future hardening option. Article parsing never injects its HTML into the app.
