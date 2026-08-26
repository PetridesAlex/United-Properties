-- Bazaraki XML feed: property fields and site settings

alter table public.properties
  add column if not exists bazaraki_district_id integer,
  add column if not exists postal_code text;

create index if not exists properties_bazaraki_district_idx
  on public.properties (bazaraki_district_id)
  where bazaraki_district_id is not null;

alter table public.site_settings
  add column if not exists bazaraki_feed_enabled boolean not null default true,
  add column if not exists bazaraki_rubric_for_sale integer,
  add column if not exists bazaraki_rubric_for_rent integer default 682,
  add column if not exists bazaraki_phone_hide boolean not null default false,
  add column if not exists bazaraki_negotiable_price boolean not null default false,
  add column if not exists bazaraki_exchange boolean not null default false;
