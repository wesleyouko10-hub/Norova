create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner', 'admin', 'member');
create type public.data_status as enum ('verified', 'likely', 'unverified', 'stale');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  domain text not null,
  name text,
  description text,
  industry text,
  employee_count integer check (employee_count is null or employee_count >= 0),
  revenue_estimate numeric check (revenue_estimate is null or revenue_estimate >= 0),
  country text,
  city text,
  founded_year integer check (founded_year is null or founded_year between 1600 and extract(year from now())::integer),
  data_status public.data_status not null default 'unverified',
  confidence numeric(4,3) check (confidence is null or confidence between 0 and 1),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, domain)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  full_name text not null,
  title text,
  department text,
  seniority text,
  location text,
  professional_profile_url text,
  work_email_status text check (work_email_status in ('valid', 'invalid', 'risky', 'unknown') or work_email_status is null),
  data_status public.data_status not null default 'unverified',
  confidence numeric(4,3) check (confidence is null or confidence between 0 and 1),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_people (
  company_id uuid not null references public.companies(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  relationship_confidence numeric(4,3) check (relationship_confidence between 0 and 1),
  created_at timestamptz not null default now(),
  primary key (company_id, person_id)
);

create index companies_workspace_updated_idx on public.companies (workspace_id, updated_at desc);
create index companies_workspace_industry_idx on public.companies (workspace_id, industry);
create index people_workspace_updated_idx on public.people (workspace_id, updated_at desc);
create index company_people_person_idx on public.company_people (person_id);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean language sql stable security invoker set search_path = public
as $$ select exists (select 1 from public.workspace_members where workspace_id = target_workspace_id and user_id = (select auth.uid())); $$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.companies enable row level security;
alter table public.people enable row level security;
alter table public.company_people enable row level security;

create policy "profiles are self readable" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles are self editable" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "members can read workspaces" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "members can read membership" on public.workspace_members for select to authenticated using (user_id = (select auth.uid()) or public.is_workspace_member(workspace_id));
create policy "members can read companies" on public.companies for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can write companies" on public.companies for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members can update companies" on public.companies for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members can read people" on public.people for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can write people" on public.people for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members can update people" on public.people for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members can read company relationships" on public.company_people for select to authenticated using (exists (select 1 from public.companies c where c.id = company_id and public.is_workspace_member(c.workspace_id)));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles (id) values (new.id); return new; end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
