create table public.lists (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.list_members (
  list_id uuid not null references public.lists(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((company_id is not null) <> (person_id is not null)),
  primary key (list_id, company_id, person_id)
);

create index lists_workspace_updated_idx on public.lists (workspace_id, updated_at desc);
create index list_members_company_idx on public.list_members (company_id) where company_id is not null;
create index list_members_person_idx on public.list_members (person_id) where person_id is not null;

alter table public.lists enable row level security;
alter table public.list_members enable row level security;

create policy "members can read lists" on public.lists for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can create lists" on public.lists for insert to authenticated with check (public.is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy "members can update lists" on public.lists for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members can read list members" on public.list_members for select to authenticated using (exists (select 1 from public.lists l where l.id = list_id and public.is_workspace_member(l.workspace_id)));
create policy "members can manage list members" on public.list_members for all to authenticated using (exists (select 1 from public.lists l where l.id = list_id and public.is_workspace_member(l.workspace_id))) with check (exists (select 1 from public.lists l where l.id = list_id and public.is_workspace_member(l.workspace_id)));
