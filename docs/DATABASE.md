# Database and RLS

Apply `supabase/migrations/202611020001_initial.sql` to a new Supabase project.

| Table            | Data                                                                           | Access                   |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------ |
| analyses         | Indexed title/topic/source, timestamps, source/result/progress JSONB aggregate | Authenticated owner only |
| user_preferences | Validated learning/reading preference JSON                                     | Authenticated owner only |
| ai_quotas        | HMAC subject, category, hourly counts and expiry                               | Server service role only |

The aggregate avoids partial saves across eight child tables and is appropriate for the MVP's read/save/delete workflow. Claims, questions, answers, learning actions and feedback live inside `analyses.payload`; no unused profile or storage tables are provisioned. Typed access lives in `src/lib/supabase/types.ts`. Runtime Zod validation applies before writes and after reads.

Every user table has explicit SELECT/INSERT/UPDATE/DELETE RLS comparing `auth.uid()` to `user_id`. Request handlers derive the user from a server-validated Supabase session and also filter by that ID. A client-provided user ID never establishes ownership. Upsert conflicts cannot overwrite other owners under the UPDATE policy. Foreign keys cascade from `auth.users` on account deletion.

The service role is used only for the quota RPC and deleting the authenticated account ID. It must never be prefixed `NEXT_PUBLIC_`. The security-definer quota function has an empty search path, no user grants, and a transaction advisory lock protecting global/subject checks. Expired counters are pruned on the next quota invocation. No source text is stored in quota records.

Retention: saved work is kept until user deletion. No guest analysis database record exists. Operational provider backups may outlive active deletion according to their settings. Use Supabase's documented backup facilities for your plan; do not promise free-tier managed backups. Users can export records as Markdown. Before changing schema, export the project with Supabase CLI/database tools and test restore in a separate project. Never commit database dumps containing user content.

Run the optional two-account isolation test against an isolated Supabase test project before release. A deterministic mocked test is not proof that deployed RLS is active.
