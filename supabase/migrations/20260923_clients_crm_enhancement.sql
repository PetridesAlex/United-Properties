-- CRM Clients enhancement: stages, assignee, property links, notes, follow-ups, activities
-- Additive only — no drops of existing data or tables.

-- ---------------------------------------------------------------------------
-- Extend clients
-- ---------------------------------------------------------------------------
alter table public.clients
  add column if not exists assigned_to uuid references public.profiles (id) on delete set null;

alter table public.clients
  add column if not exists process_stage text not null default 'new_lead';

alter table public.clients
  add column if not exists client_type text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'clients_process_stage_check'
  ) then
    alter table public.clients
      add constraint clients_process_stage_check
      check (process_stage in (
        'new_lead',
        'contacted',
        'properties_suggested',
        'interested',
        'viewing_scheduled',
        'viewing_completed',
        'negotiation',
        'offer_made',
        'deal_in_progress',
        'completed',
        'lost_inactive'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'clients_client_type_check'
  ) then
    alter table public.clients
      add constraint clients_client_type_check
      check (
        client_type is null
        or client_type in ('buyer', 'seller', 'tenant', 'investor', 'other')
      );
  end if;
end $$;

create index if not exists clients_assigned_to_idx on public.clients (assigned_to);
create index if not exists clients_process_stage_idx on public.clients (process_stage);

-- ---------------------------------------------------------------------------
-- client_properties
-- ---------------------------------------------------------------------------
create table if not exists public.client_properties (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  interest_status text not null default 'suggested'
    check (interest_status in (
      'suggested',
      'sent_to_client',
      'interested',
      'viewing_requested',
      'viewing_scheduled',
      'viewed',
      'offer_made',
      'negotiation',
      'not_interested',
      'completed'
    )),
  notes text,
  linked_by uuid references public.profiles (id) on delete set null,
  linked_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (client_id, property_id)
);

create index if not exists client_properties_client_id_idx
  on public.client_properties (client_id);
create index if not exists client_properties_property_id_idx
  on public.client_properties (property_id);
create index if not exists client_properties_interest_status_idx
  on public.client_properties (interest_status);

drop trigger if exists client_properties_set_updated_at on public.client_properties;
create trigger client_properties_set_updated_at
  before update on public.client_properties
  for each row execute function public.set_updated_at();

alter table public.client_properties enable row level security;

drop policy if exists "Editors manage client_properties" on public.client_properties;
create policy "Editors manage client_properties"
  on public.client_properties for all
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

grant select, insert, update, delete on table public.client_properties to authenticated;

-- ---------------------------------------------------------------------------
-- client_notes
-- ---------------------------------------------------------------------------
create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  body text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_notes_client_id_idx
  on public.client_notes (client_id, created_at desc);

drop trigger if exists client_notes_set_updated_at on public.client_notes;
create trigger client_notes_set_updated_at
  before update on public.client_notes
  for each row execute function public.set_updated_at();

alter table public.client_notes enable row level security;

drop policy if exists "Editors manage client_notes" on public.client_notes;
create policy "Editors manage client_notes"
  on public.client_notes for all
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

grant select, insert, update, delete on table public.client_notes to authenticated;

-- Migrate legacy free-text notes into client_notes once
insert into public.client_notes (client_id, body, created_by, created_at)
select c.id, c.notes, c.created_by, coalesce(c.updated_at, c.created_at)
from public.clients c
where c.notes is not null
  and btrim(c.notes) <> ''
  and not exists (
    select 1 from public.client_notes n where n.client_id = c.id
  );

-- ---------------------------------------------------------------------------
-- client_follow_ups
-- ---------------------------------------------------------------------------
create table if not exists public.client_follow_ups (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  starts_at timestamptz not null,
  type text not null default 'follow_up'
    check (type in (
      'follow_up',
      'phone_call',
      'meeting',
      'viewing',
      'contract',
      'payment',
      'deposit',
      'reminder',
      'other'
    )),
  status text not null default 'upcoming'
    check (status in ('upcoming', 'today', 'completed', 'cancelled', 'overdue')),
  title text not null default '',
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_follow_ups_client_id_idx
  on public.client_follow_ups (client_id, starts_at);
create index if not exists client_follow_ups_assigned_to_idx
  on public.client_follow_ups (assigned_to);
create index if not exists client_follow_ups_starts_at_idx
  on public.client_follow_ups (starts_at);
create index if not exists client_follow_ups_status_idx
  on public.client_follow_ups (status);

drop trigger if exists client_follow_ups_set_updated_at on public.client_follow_ups;
create trigger client_follow_ups_set_updated_at
  before update on public.client_follow_ups
  for each row execute function public.set_updated_at();

alter table public.client_follow_ups enable row level security;

drop policy if exists "Editors manage client_follow_ups" on public.client_follow_ups;
create policy "Editors manage client_follow_ups"
  on public.client_follow_ups for all
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

grant select, insert, update, delete on table public.client_follow_ups to authenticated;

-- ---------------------------------------------------------------------------
-- client_activities (audit / timeline)
-- ---------------------------------------------------------------------------
create table if not exists public.client_activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  description text not null default '',
  previous_value text,
  new_value text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists client_activities_client_id_idx
  on public.client_activities (client_id, created_at desc);
create index if not exists client_activities_actor_id_idx
  on public.client_activities (actor_id, created_at desc);
create index if not exists client_activities_action_idx
  on public.client_activities (action);
create index if not exists client_activities_created_at_idx
  on public.client_activities (created_at desc);

alter table public.client_activities enable row level security;

drop policy if exists "Editors manage client_activities" on public.client_activities;
create policy "Editors manage client_activities"
  on public.client_activities for all
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

grant select, insert, update, delete on table public.client_activities to authenticated;

-- ---------------------------------------------------------------------------
-- admin_appointments — link to clients / properties / follow-ups
-- ---------------------------------------------------------------------------
-- Created here too in case 20260901_admin_appointments.sql was never applied.
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

drop trigger if exists admin_appointments_set_updated_at on public.admin_appointments;
create trigger admin_appointments_set_updated_at
  before update on public.admin_appointments
  for each row execute function public.set_updated_at();

alter table public.admin_appointments enable row level security;

drop policy if exists "Admins manage appointments" on public.admin_appointments;
create policy "Admins manage appointments"
  on public.admin_appointments for all
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

grant select, insert, update, delete on table public.admin_appointments to authenticated;

alter table public.admin_appointments
  add column if not exists client_id uuid references public.clients (id) on delete set null;

alter table public.admin_appointments
  add column if not exists property_id uuid references public.properties (id) on delete set null;

alter table public.admin_appointments
  add column if not exists follow_up_id uuid references public.client_follow_ups (id) on delete set null;

create index if not exists admin_appointments_client_id_idx
  on public.admin_appointments (client_id);
create index if not exists admin_appointments_property_id_idx
  on public.admin_appointments (property_id);
create index if not exists admin_appointments_follow_up_id_idx
  on public.admin_appointments (follow_up_id);
