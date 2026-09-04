-- Separate gallery photos from floor-plan images on listings.
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
