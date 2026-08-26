# panos-real-estate-project

Premium luxury real estate frontend for Cyprus, built with React + Vite, plus a Supabase-powered CMS at `/admin`.

## Stack

- React + Vite (public site: JSX; CMS: TypeScript)
- React Router
- Framer Motion
- Lucide React
- React Helmet Async
- Supabase (Auth, Postgres, Storage)

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` → `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (anon / public JWT only — never a service-role key)

Restart the dev server after changing `.env`.

## Database setup

1. Open Supabase → **SQL Editor**
2. Run [`supabase/migrations/20260826_001_cms_schema.sql`](supabase/migrations/20260826_001_cms_schema.sql)
3. Create an Auth user (Authentication → Users)
4. Activate admin access:

```sql
update public.profiles
set active = true, role = 'super_admin', full_name = 'Admin'
where email = 'you@example.com';
```

5. Sign in at `/admin/login`

Optional seed from static listings:

```bash
SEED_ACCESS_TOKEN=<admin_access_token> node scripts/seed-properties-from-static.mjs
```

## Build / checks

```bash
npm run build
npm run typecheck
npm run lint
```

## CMS

Staff manage properties, images, website content, settings, enquiries, and Bazaraki at `/admin` without using the Supabase dashboard for day-to-day work.

## Bazaraki XML feed

Properties marked **Publish to Bazaraki** with a valid district, postal code, and readiness checks appear in the live XML feed:

**Feed URL:** `https://www.unitedproperties.eu/api/bazaraki.xml`

1. Run migrations in Supabase SQL Editor:
   - `supabase/migrations/20260827_bazaraki_fields.sql`
   - `supabase/migrations/20260828_bazaraki_category_fields.sql`
   - `supabase/migrations/20260829_land_property_fields.sql`
2. Configure per-category rubric IDs under **Admin → Settings → Bazaraki integration** (defaults from Bazaraki guide):

   | Category | For sale | To rent |
   |---|---:|---:|
   | Apartments | 3528 | 3529 |
   | Houses | 678 | 681 |
   | Residential buildings | 2790 | — |
   | Prefabricated houses | 3303 | — |
   | Other | 142 | 3531 |
   | Commercial | 2405 | 2408 |
   | Plots of land | 141 | 3530 |

3. On each property, set **Bazaraki district**, **Postal code**, and schema-specific fields when publishing to Bazaraki
4. Register the feed URL in [Bazaraki profile settings](https://www.bazaraki.com/profile/settings/)

Refresh district data (optional):

```bash
npm run fetch:bazaraki-districts
```

Smoke test formatters/XML:

```bash
npm run test:bazaraki
```

## Public listings

Published properties are loaded from Supabase. Until the CMS is seeded, the site falls back to static data in `src/data/properties.js`.

Routes:

- `/buy` — `for_sale` + published
- `/rent` — `for_rent` + published
- `/sold` — `sold` + published
- `/rented` — `rented` + published

## Inquiries

The contact / inquiry form inserts into `public.inquiries` (optional `property_id`). Admins review them under **Admin → Enquiries**.
