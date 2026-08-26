-- United Properties CMS schema + RLS
-- Safe to re-run (idempotent where practical).
-- Run in Supabase → SQL Editor (or via supabase db push).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.property_status as enum ('for_sale', 'for_rent', 'sold', 'rented');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.profile_role as enum (
    'super_admin',
    'admin',
    'property_manager',
    'content_editor'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Helpers (no table deps yet)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (must exist before is_admin / is_property_editor)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.profile_role not null default 'admin',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth helpers (depend on public.profiles)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('super_admin', 'admin', 'property_manager', 'content_editor')
  );
$$;

create or replace function public.is_property_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('super_admin', 'admin', 'property_manager')
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "Profiles: users read own" on public.profiles;
create policy "Profiles: users read own"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Profiles: admins update" on public.profiles;
create policy "Profiles: admins update"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Auto-create profile on signup (inactive until a super admin promotes them)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'admin',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Properties + reference sequence
-- ---------------------------------------------------------------------------
create sequence if not exists public.property_reference_seq start 1;

create or replace function public.next_property_reference()
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  n := nextval('public.property_reference_seq');
  return 'UP-' || lpad(n::text, 4, '0');
end;
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique default public.next_property_reference(),
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  status public.property_status not null default 'for_sale',
  property_type text,
  price numeric(14, 2),
  currency text not null default 'EUR',
  district text,
  city text,
  area text,
  address text,
  latitude double precision,
  longitude double precision,
  bedrooms integer,
  bathrooms integer,
  internal_area numeric(12, 2),
  covered_area numeric(12, 2),
  plot_size numeric(12, 2),
  floor integer,
  floors_total integer,
  year_built integer,
  parking_spaces integer,
  furnishing text,
  condition text,
  energy_efficiency text,
  features text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  publish_to_bazaraki boolean not null default false,
  internal_notes text,
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz,
  constraint properties_price_non_negative check (price is null or price >= 0)
);

-- Prevent reference_number changes
create or replace function public.protect_property_reference()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.reference_number is distinct from old.reference_number then
    raise exception 'reference_number is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists properties_protect_reference on public.properties;
create trigger properties_protect_reference
  before update on public.properties
  for each row execute function public.protect_property_reference();

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_published_idx on public.properties (published) where archived_at is null;
create index if not exists properties_featured_idx on public.properties (featured) where published = true and archived_at is null;
create index if not exists properties_city_idx on public.properties (city);
create index if not exists properties_slug_idx on public.properties (slug);
create index if not exists properties_price_idx on public.properties (price);

alter table public.properties enable row level security;

drop policy if exists "Properties: public read published" on public.properties;
create policy "Properties: public read published"
  on public.properties for select
  to anon, authenticated
  using (published = true and archived_at is null);

drop policy if exists "Properties: admin full select" on public.properties;
create policy "Properties: admin full select"
  on public.properties for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Properties: editors insert" on public.properties;
create policy "Properties: editors insert"
  on public.properties for insert
  to authenticated
  with check (public.is_property_editor());

drop policy if exists "Properties: editors update" on public.properties;
create policy "Properties: editors update"
  on public.properties for update
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

drop policy if exists "Properties: editors delete" on public.properties;
create policy "Properties: editors delete"
  on public.properties for delete
  to authenticated
  using (public.is_property_editor());

-- ---------------------------------------------------------------------------
-- Property images
-- ---------------------------------------------------------------------------
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  image_url text not null,
  storage_path text,
  alt_text text,
  position integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists property_images_property_id_idx on public.property_images (property_id, position);

alter table public.property_images enable row level security;

drop policy if exists "Property images: public read for published" on public.property_images;
create policy "Property images: public read for published"
  on public.property_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.published = true
        and p.archived_at is null
    )
    or public.is_admin()
  );

drop policy if exists "Property images: editors insert" on public.property_images;
create policy "Property images: editors insert"
  on public.property_images for insert
  to authenticated
  with check (public.is_property_editor());

drop policy if exists "Property images: editors update" on public.property_images;
create policy "Property images: editors update"
  on public.property_images for update
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

drop policy if exists "Property images: editors delete" on public.property_images;
create policy "Property images: editors delete"
  on public.property_images for delete
  to authenticated
  using (public.is_property_editor());

-- ---------------------------------------------------------------------------
-- Site content
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  content_key text not null,
  content_type text not null default 'text',
  value text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  unique (page, section, content_key)
);

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Site content: public read" on public.site_content;
create policy "Site content: public read"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Site content: admin write" on public.site_content;
create policy "Site content: admin write"
  on public.site_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Site settings (singleton row)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'United Properties',
  company_logo_url text,
  phone text,
  email text,
  address text,
  opening_hours text,
  social_instagram text,
  social_linkedin text,
  social_facebook text,
  social_whatsapp text,
  social_telegram text,
  google_maps_embed_url text,
  google_maps_link text,
  default_seo_title text,
  default_seo_description text,
  company_registration text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "Site settings: public read" on public.site_settings;
create policy "Site settings: public read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Site settings: admin update" on public.site_settings;
create policy "Site settings: admin update"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Extend inquiries
-- ---------------------------------------------------------------------------
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
  add column if not exists property_id uuid references public.properties (id) on delete set null;

alter table public.inquiries
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

alter table public.inquiries enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on table public.inquiries to anon, authenticated;
grant select, update on table public.inquiries to authenticated;
grant select on table public.properties to anon, authenticated;
grant select on table public.property_images to anon, authenticated;
grant select on table public.site_content to anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant select on table public.profiles to authenticated;
grant all on table public.properties to authenticated;
grant all on table public.property_images to authenticated;
grant all on table public.site_content to authenticated;
grant update on table public.site_settings to authenticated;

drop policy if exists "Public can insert inquiries" on public.inquiries;
create policy "Public can insert inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Inquiries: admin select" on public.inquiries;
create policy "Inquiries: admin select"
  on public.inquiries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Inquiries: admin update" on public.inquiries;
create policy "Inquiries: admin update"
  on public.inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'properties',
    'properties',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'site-assets',
    'site-assets',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read property images bucket" on storage.objects;
create policy "Public read property images bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('properties', 'site-assets'));

drop policy if exists "Admins upload property images" on storage.objects;
create policy "Admins upload property images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('properties', 'site-assets') and public.is_property_editor());

drop policy if exists "Admins update property images" on storage.objects;
create policy "Admins update property images"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('properties', 'site-assets') and public.is_property_editor())
  with check (bucket_id in ('properties', 'site-assets') and public.is_property_editor());

drop policy if exists "Admins delete property images" on storage.objects;
create policy "Admins delete property images"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('properties', 'site-assets') and public.is_property_editor());

-- ---------------------------------------------------------------------------
-- Bootstrap note (run manually after creating Auth user):
-- update public.profiles set active = true, role = 'super_admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------------
