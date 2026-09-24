create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 80),
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default array['companies:read','people:read'],
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index api_keys_workspace_idx on public.api_keys (workspace_id, created_at desc);
alter table public.api_keys enable row level security;
create policy "members can read api keys" on public.api_keys for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can create api keys" on public.api_keys for insert to authenticated with check (public.is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy "members can revoke api keys" on public.api_keys for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
