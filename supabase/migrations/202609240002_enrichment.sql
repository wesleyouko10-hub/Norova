create type public.enrichment_job_status as enum ('queued', 'processing', 'completed', 'failed', 'partial');

create table public.enrichment_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  file_name text not null,
  status public.enrichment_job_status not null default 'queued',
  total_rows integer not null default 0 check (total_rows >= 0),
  processed_rows integer not null default 0 check (processed_rows >= 0),
  successful_rows integer not null default 0 check (successful_rows >= 0),
  failed_rows integer not null default 0 check (failed_rows >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.enrichment_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.enrichment_jobs(id) on delete cascade,
  row_number integer not null check (row_number > 0),
  input_data jsonb not null default '{}'::jsonb,
  output_data jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  unique (job_id, row_number)
);

create table public.company_sources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider text not null,
  source_url text,
  observed_at timestamptz not null default now(),
  confidence numeric(4,3) check (confidence between 0 and 1),
  metadata jsonb not null default '{}'::jsonb
);

create index enrichment_jobs_workspace_created_idx on public.enrichment_jobs (workspace_id, created_at desc);
create index enrichment_results_job_row_idx on public.enrichment_results (job_id, row_number);
create index company_sources_company_idx on public.company_sources (company_id, observed_at desc);

alter table public.enrichment_jobs enable row level security;
alter table public.enrichment_results enable row level security;
alter table public.company_sources enable row level security;

create policy "members can read enrichment jobs" on public.enrichment_jobs for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can create enrichment jobs" on public.enrichment_jobs for insert to authenticated with check (public.is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy "members can read enrichment results" on public.enrichment_results for select to authenticated using (exists (select 1 from public.enrichment_jobs j where j.id = job_id and public.is_workspace_member(j.workspace_id)));
create policy "members can read company sources" on public.company_sources for select to authenticated using (exists (select 1 from public.companies c where c.id = company_id and public.is_workspace_member(c.workspace_id)));
