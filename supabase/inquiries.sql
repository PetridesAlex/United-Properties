-- Run in Supabase → SQL Editor (once).
-- Enables website inquiry form inserts via the anon key + RLS.

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

alter table public.inquiries enable row level security;

-- Allow anonymous inserts from the public site (anon key).
drop policy if exists "Public can insert inquiries" on public.inquiries;
create policy "Public can insert inquiries"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (true);

-- No public SELECT/UPDATE/DELETE — review rows in the Supabase Table Editor
-- (or add a separate authenticated policy for your team later).
