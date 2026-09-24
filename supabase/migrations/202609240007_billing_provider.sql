create table if not exists public.billing_events (
  id bigint generated always as identity primary key,
  provider text not null,
  provider_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists public.workspace_entitlements (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','starter','growth','business','enterprise')),
  credits_limit bigint not null default 50,
  api_requests_limit bigint not null default 0,
  team_members_limit integer not null default 1,
  ai_research_limit integer not null default 5,
  updated_at timestamptz not null default now()
);
create index if not exists billing_events_created_idx on public.billing_events(created_at desc);
alter table public.billing_events enable row level security;
alter table public.workspace_entitlements enable row level security;
create policy "members can read workspace entitlements" on public.workspace_entitlements for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can read billing events" on public.billing_events for select to authenticated using (false);
