create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  plan text not null default 'starter' check (plan in ('starter','growth','pro','business','enterprise')),
  status text not null default 'trialing' check (status in ('trialing','active','past_due','canceled','paused')),
  provider text not null default 'lemonsqueezy',
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.credit_balances (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
create table public.credit_transactions (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  operation text not null,
  credits integer not null check (credits > 0),
  reference_id text,
  created_at timestamptz not null default now()
);
create index credit_transactions_workspace_created_idx on public.credit_transactions(workspace_id, created_at desc);
alter table public.subscriptions enable row level security;
alter table public.credit_balances enable row level security;
alter table public.credit_transactions enable row level security;
create policy "members can read subscriptions" on public.subscriptions for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can read credit balances" on public.credit_balances for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can read credit transactions" on public.credit_transactions for select to authenticated using (public.is_workspace_member(workspace_id));
create or replace function public.consume_credits(p_workspace_id uuid, p_user_id uuid, p_operation text, p_credits integer, p_reference_id text default null)
returns boolean language plpgsql security invoker set search_path = public as $$
declare remaining bigint;
begin
  if p_credits <= 0 or not public.is_workspace_member(p_workspace_id) then return false; end if;
  update public.credit_balances set balance = balance - p_credits, updated_at = now() where workspace_id = p_workspace_id and balance >= p_credits returning balance into remaining;
  if not found then return false; end if;
  insert into public.credit_transactions(workspace_id, user_id, operation, credits, reference_id) values (p_workspace_id, p_user_id, p_operation, p_credits, p_reference_id);
  return true;
end; $$;
