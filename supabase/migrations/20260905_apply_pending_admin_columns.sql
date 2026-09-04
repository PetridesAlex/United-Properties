-- Run once in Supabase → SQL Editor, then hard-refresh the admin page.
-- Fixes: show_location_map schema-cache errors + gallery/floor-plan image kind.

alter table public.properties
  add column if not exists show_location_map boolean not null default false;

comment on column public.properties.show_location_map is
  'When true, the website shows the Google Map pin; when false, location map is available on request.';

alter table public.property_images
  add column if not exists kind text not null default 'gallery';

alter table public.property_images
  drop constraint if exists property_images_kind_check;

alter table public.property_images
  add constraint property_images_kind_check
  check (kind in ('gallery', 'floor_plan'));

create index if not exists property_images_property_kind_idx
  on public.property_images (property_id, kind, position);

comment on column public.property_images.kind is
  'gallery = listing photos; floor_plan = website floor-plan images';

-- Refresh PostgREST schema cache (Supabase).
notify pgrst, 'reload schema';
