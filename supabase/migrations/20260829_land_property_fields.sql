-- Land / plot property fields (normal property data, not Bazaraki-prefixed)

alter table public.properties
  add column if not exists land_type text,
  add column if not exists plot_type text,
  add column if not exists coverage text,
  add column if not exists building_density text,
  add column if not exists planning_zone text,
  add column if not exists parcel_number text,
  add column if not exists share text;

alter table public.site_settings
  add column if not exists bazaraki_rubric_plots_sale integer default 141,
  add column if not exists bazaraki_rubric_plots_rent integer default 3530;
