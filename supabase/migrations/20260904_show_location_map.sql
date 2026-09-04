-- Opt-in public location map on property detail pages.
alter table public.properties
  add column if not exists show_location_map boolean not null default false;

comment on column public.properties.show_location_map is
  'When true, the website shows the Google Map pin; when false, location map is available on request.';
