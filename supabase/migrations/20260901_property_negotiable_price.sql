-- Per-listing negotiable price flag (Bazaraki form checkbox on property details).
alter table public.properties
  add column if not exists bazaraki_negotiable_price boolean not null default false;
