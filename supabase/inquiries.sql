-- Prefer the full CMS migration:
--   supabase/migrations/20260826_001_cms_schema.sql
--
-- Minimal legacy path (inquiries only) for older setups:

create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  subject text,
  property_interest text,
  preferred_contact text,
  message text not null,
  source text default 'website',
  status text not null default 'new'
);

alter table public.inquiries
  add column if not exists property_id uuid;

alter table public.inquiries
  add column if not exists updated_at timestamptz not null default now();

alter table public.inquiries enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on table public.inquiries to anon, authenticated;

drop policy if exists "Public can insert inquiries" on public.inquiries;
create policy "Public can insert inquiries"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (true);
