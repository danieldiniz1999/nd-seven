-- Nexus CRM: multi-tenant core. Secrets for Asaas, Resend and Evolution belong
-- only in Supabase Edge Function secrets, never in this migration or client app.
create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin', 'owner', 'manager', 'member');
create type public.subscription_status as enum ('pending', 'active', 'past_due', 'expired', 'blocked', 'cancelled');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null unique default ('nxs-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  legal_name text not null,
  document text not null unique,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  asaas_customer_id text unique,
  asaas_subscription_id text unique,
  plan_code text not null,
  amount numeric(12,2) not null,
  status public.subscription_status not null default 'pending',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'lead',
  owner_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  name text not null,
  position integer not null,
  unique (pipeline_id, position)
);
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  stage_id uuid references public.pipeline_stages(id) on delete set null,
  title text not null,
  value numeric(12,2) not null default 0,
  owner_id uuid references public.profiles(id),
  expected_close_date date,
  created_at timestamptz not null default now()
);
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.is_super_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active);
$$;
create or replace function public.current_company_id() returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid() and is_active;
$$;
create or replace function public.can_access_company(target_company uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin() or target_company = public.current_company_id();
$$;

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.contacts enable row level security;
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;

create policy "company access" on public.companies for select using (public.can_access_company(id));
create policy "profile access" on public.profiles for select using (public.is_super_admin() or company_id = public.current_company_id() or id = auth.uid());
create policy "subscription access" on public.subscriptions for select using (public.can_access_company(company_id));
create policy "contact tenant isolation" on public.contacts for all using (public.can_access_company(company_id)) with check (public.can_access_company(company_id));
create policy "pipeline tenant isolation" on public.pipelines for all using (public.can_access_company(company_id)) with check (public.can_access_company(company_id));
create policy "stages tenant isolation" on public.pipeline_stages for all using (exists (select 1 from public.pipelines p where p.id = pipeline_id and public.can_access_company(p.company_id))) with check (exists (select 1 from public.pipelines p where p.id = pipeline_id and public.can_access_company(p.company_id)));
create policy "deal tenant isolation" on public.deals for all using (public.can_access_company(company_id)) with check (public.can_access_company(company_id));
create policy "activity tenant isolation" on public.activities for all using (public.can_access_company(company_id)) with check (public.can_access_company(company_id));

-- No public insert policy exists for companies/users. The webhook runs with the
-- service role after a verified PAYMENT_CONFIRMED event, creates the workspace
-- ID, user, subscription and welcome email atomically.
