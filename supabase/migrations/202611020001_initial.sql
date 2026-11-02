-- Run once in the Supabase SQL Editor, or use `supabase db push`.
create table public.analyses (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  topic text not null check (char_length(topic) between 1 and 80),
  source_type text not null check (source_type in ('text','url','transcript')),
  payload jsonb not null check (octet_length(payload::text) <= 400000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payload_id_matches check (payload->'analysis'->>'id' = id::text)
);
create index analyses_owner_date_idx on public.analyses(user_id, created_at desc);
create index analyses_owner_topic_idx on public.analyses(user_id, topic);
alter table public.analyses enable row level security;
create policy "Select own analyses" on public.analyses for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own analyses" on public.analyses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own analyses" on public.analyses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own analyses" on public.analyses for delete to authenticated using ((select auth.uid()) = user_id);

-- A JSON document is the aggregate boundary: content, generated claims/questions,
-- answers, feedback and takeaway save atomically under the same ownership policy.
-- These can be normalized into child tables later without changing the API.
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null check (octet_length(preferences::text) <= 16000),
  updated_at timestamptz not null default now()
);
alter table public.user_preferences enable row level security;
create policy "Select own preferences" on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own preferences" on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own preferences" on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own preferences" on public.user_preferences for delete to authenticated using ((select auth.uid()) = user_id);

create table public.ai_quotas (
  subject text not null,
  kind text not null,
  bucket timestamptz not null,
  requests integer not null default 0 check (requests >= 0),
  expires_at timestamptz not null,
  primary key(subject, kind, bucket)
);
create index ai_quotas_expiry_idx on public.ai_quotas(expires_at);
alter table public.ai_quotas enable row level security;
revoke all on public.ai_quotas from anon, authenticated;

-- Atomic per-subject and global hourly request budgets. Only the server's service
-- role may call this. Never expose that key in the browser.
create or replace function public.consume_ai_quota(p_subject text,p_kind text,p_limit integer,p_global_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  hour_bucket timestamptz := date_trunc('hour',now());
  subject_count integer;
  total_count integer;
begin
  if char_length(p_subject) <> 64 or p_kind not in ('analysis','reflection') or p_limit < 1 or p_global_limit < 1 then return false; end if;
  -- One transaction lock serializes budget changes across all server instances.
  perform pg_advisory_xact_lock(724811912);
  delete from public.ai_quotas where expires_at <= now();
  select requests into subject_count from public.ai_quotas where subject = p_subject and kind = p_kind and bucket = hour_bucket;
  select requests into total_count from public.ai_quotas where subject = 'global' and kind = 'all' and bucket = hour_bucket;
  if coalesce(subject_count,0) >= p_limit or coalesce(total_count,0) >= p_global_limit then return false; end if;
  insert into public.ai_quotas(subject,kind,bucket,requests,expires_at) values(p_subject,p_kind,hour_bucket,1,hour_bucket+interval '2 hours')
  on conflict(subject,kind,bucket) do update set requests = public.ai_quotas.requests+1;
  insert into public.ai_quotas(subject,kind,bucket,requests,expires_at) values('global','all',hour_bucket,1,hour_bucket+interval '2 hours')
  on conflict(subject,kind,bucket) do update set requests = public.ai_quotas.requests+1;
  return true;
end; $$;
revoke all on function public.consume_ai_quota(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(text,text,integer,integer) to service_role;
grant select,insert,update,delete on public.analyses, public.user_preferences to authenticated;
revoke all on public.analyses, public.user_preferences from anon;
