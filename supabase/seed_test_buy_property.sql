-- Test buy property for United Properties CMS preview
-- Run in Supabase → SQL Editor

insert into public.properties (
  slug,
  title,
  short_description,
  description,
  status,
  property_type,
  price,
  currency,
  district,
  city,
  area,
  address,
  bedrooms,
  bathrooms,
  internal_area,
  covered_area,
  plot_size,
  floor,
  floors_total,
  year_built,
  parking_spaces,
  furnishing,
  condition,
  energy_efficiency,
  features,
  featured,
  published,
  publish_to_bazaraki,
  seo_title,
  seo_description,
  published_at,
  internal_notes
)
values (
  'test-limassol-marina-buy-listing',
  'Test Listing — Limassol Marina Apartment',
  'A CMS preview listing for the Buy page. Safe to edit or archive.',
  'This is a test property created to preview how Buy listings appear on the United Properties website and in the CMS.

Sea-facing apartment near Limassol Marina with open living space, modern finishes, and covered parking. Use this record to try Mark as Sold, featured toggle, images, and publish settings.',
  'for_sale',
  'Apartment',
  875000,
  'EUR',
  'Limassol',
  'Limassol',
  'Limassol Marina',
  '18 Marina Avenue, Limassol',
  3,
  2,
  148,
  162,
  0,
  5,
  8,
  2021,
  2,
  'Furnished',
  'Excellent',
  'A',
  array[
    'Sea view',
    'Covered parking',
    'Communal pool',
    'Underfloor heating',
    'Smart home ready'
  ],
  true,
  true,
  false,
  'Test Limassol Marina Apartment for Sale | United Properties',
  'CMS test listing — 3-bedroom apartment near Limassol Marina.',
  now(),
  'TEST PROPERTY — safe to archive or delete after preview.'
)
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  status = excluded.status,
  property_type = excluded.property_type,
  price = excluded.price,
  featured = excluded.featured,
  published = excluded.published,
  published_at = coalesce(public.properties.published_at, now()),
  updated_at = now();

-- Replace images for this test slug
delete from public.property_images
where property_id = (
  select id from public.properties where slug = 'test-limassol-marina-buy-listing'
);

insert into public.property_images (property_id, image_url, storage_path, alt_text, position, is_featured)
select
  p.id,
  img.url,
  null,
  img.alt,
  img.pos,
  img.featured
from public.properties p
cross join (
  values
    (
      0,
      true,
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      'Test listing exterior'
    ),
    (
      1,
      false,
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
      'Test listing living area'
    ),
    (
      2,
      false,
      'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1600&q=80',
      'Test listing interior'
    )
) as img(pos, featured, url, alt)
where p.slug = 'test-limassol-marina-buy-listing';
