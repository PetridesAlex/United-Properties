-- Optional cloud sync for admin appointments (local calendar works without this).
create table if not exists public.admin_appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_on date not null,
  start_time time not null,
  end_time time not null,
  appointment_type text not null default 'meeting'
    check (appointment_type in ('viewing', 'meeting', 'call', 'other')),
  location text,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_appointments_date_idx
  on public.admin_appointments (starts_on, start_time);

alter table public.admin_appointments enable row level security;

drop policy if exists "Admins manage appointments" on public.admin_appointments;
create policy "Admins manage appointments"
  on public.admin_appointments for all
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

grant select, insert, update, delete on table public.admin_appointments to authenticated;
