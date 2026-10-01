-- Run this migration in Supabase SQL Editor or through the Supabase CLI.
create type public.app_role as enum ('principal_admin', 'finance', 'direction');
create type public.transaction_kind as enum ('income', 'expense');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.request_status as enum ('pending_finance', 'pending_admin', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'direction',
  created_at timestamptz not null default now()
);
create table public.classes (id uuid primary key default gen_random_uuid(), name text not null unique, level text, capacity int check (capacity > 0), created_at timestamptz not null default now());
create table public.students (id uuid primary key default gen_random_uuid(), full_name text not null, guardian_name text, guardian_phone text, class_id uuid references public.classes(id) on delete set null, enrolled_at date not null default current_date, created_at timestamptz not null default now());
create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(), label text not null, category text not null, amount numeric(14,2) not null check (amount > 0), kind public.transaction_kind not null,
  status public.approval_status not null default 'pending', created_by uuid not null references public.profiles(id), validated_by uuid references public.profiles(id), validated_at timestamptz, created_at timestamptz not null default now()
);
create table public.school_requests (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  details text not null,
  amount numeric(14,2) check (amount is null or amount > 0),
  status public.request_status not null default 'pending_finance',
  requested_by uuid not null references public.profiles(id),
  evaluated_by uuid references public.profiles(id),
  evaluated_at timestamptz,
  validated_by uuid references public.profiles(id),
  validated_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.school_requests enable row level security;

create function public.current_role() returns public.app_role language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid() $$;
create function public.is_principal_admin() returns boolean language sql stable security definer set search_path = public as $$ select public.current_role() = 'principal_admin' $$;
create function public.keep_alive() returns timestamptz language sql security definer set search_path = public as $$ select now() $$;
grant execute on function public.keep_alive() to service_role;

create policy "Authenticated staff can read profiles" on public.profiles for select to authenticated using (true);
create policy "Principal admins create staff" on public.profiles for insert to authenticated with check (public.is_principal_admin());
create policy "Principal admins update staff" on public.profiles for update to authenticated using (public.is_principal_admin());
create policy "Direction manage classes" on public.classes for all to authenticated using (public.current_role() in ('principal_admin','direction')) with check (public.current_role() in ('principal_admin','direction'));
create policy "Direction manage students" on public.students for all to authenticated using (public.current_role() in ('principal_admin','direction')) with check (public.current_role() in ('principal_admin','direction'));
create policy "Staff read finance" on public.financial_transactions for select to authenticated using (true);
create policy "Finance records transactions" on public.financial_transactions for insert to authenticated with check (public.current_role() = 'finance' and created_by = auth.uid());
create policy "Principal validates finance" on public.financial_transactions for update to authenticated using (public.is_principal_admin()) with check (public.is_principal_admin());

-- Circuit obligatoire : Direction -> Finance -> Admin principale.
create policy "Staff read school requests" on public.school_requests for select to authenticated using (true);
create policy "Direction creates requests" on public.school_requests for insert to authenticated
  with check (public.current_role() = 'direction' and requested_by = auth.uid() and status = 'pending_finance' and amount is null);
create policy "Finance evaluates requests" on public.school_requests for update to authenticated
  using (public.current_role() = 'finance' and status = 'pending_finance')
  with check (public.current_role() = 'finance' and status = 'pending_admin' and amount > 0 and evaluated_by = auth.uid() and evaluated_at is not null);
create policy "Principal validates requests" on public.school_requests for update to authenticated
  using (public.is_principal_admin() and status = 'pending_admin')
  with check (public.is_principal_admin() and status in ('approved','rejected') and validated_by = auth.uid() and validated_at is not null);
