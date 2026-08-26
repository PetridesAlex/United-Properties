-- Bazaraki category-specific property fields and per-category rubric settings

alter table public.properties
  add column if not exists bazaraki_must_haves integer[],
  add column if not exists bazaraki_online_viewing boolean not null default false,
  add column if not exists bazaraki_air_conditioning smallint,
  add column if not exists bazaraki_parking smallint,
  add column if not exists bazaraki_pets smallint,
  add column if not exists bazaraki_house_type smallint,
  add column if not exists bazaraki_commercial_type smallint,
  add column if not exists registration_block integer,
  add column if not exists registration_number integer;

alter table public.site_settings
  add column if not exists bazaraki_rubric_apartments_sale integer default 3528,
  add column if not exists bazaraki_rubric_apartments_rent integer default 3529,
  add column if not exists bazaraki_rubric_houses_sale integer default 678,
  add column if not exists bazaraki_rubric_houses_rent integer default 681,
  add column if not exists bazaraki_rubric_residential_buildings_sale integer default 2790,
  add column if not exists bazaraki_rubric_prefabricated_houses_sale integer default 3303,
  add column if not exists bazaraki_rubric_other_sale integer default 142,
  add column if not exists bazaraki_rubric_other_rent integer default 3531,
  add column if not exists bazaraki_rubric_commercial_sale integer default 2405,
  add column if not exists bazaraki_rubric_commercial_rent integer default 2408;

-- Migrate legacy rubric columns if present
update public.site_settings
set
  bazaraki_rubric_houses_rent = coalesce(bazaraki_rubric_for_rent, bazaraki_rubric_houses_rent, 681),
  bazaraki_rubric_houses_sale = coalesce(bazaraki_rubric_for_sale, bazaraki_rubric_houses_sale, 678)
where id = 1;
