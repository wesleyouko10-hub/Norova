create table public.api_requests (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  api_key_id uuid references public.api_keys(id) on delete set null,
  endpoint text not null,
  status_code integer not null check (status_code between 100 and 599),
  credits integer not null default 0 check (credits >= 0),
  latency_ms integer,
  created_at timestamptz not null default now()
);
create index api_requests_workspace_created_idx on public.api_requests (workspace_id, created_at desc);
create index api_requests_key_created_idx on public.api_requests (api_key_id, created_at desc);
alter table public.api_requests enable row level security;
create policy "members can read api requests" on public.api_requests for select to authenticated using (public.is_workspace_member(workspace_id));
