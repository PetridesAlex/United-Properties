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

Staff manage properties, images, website content, settings, enquiries, and Bazaraki readiness at `/admin` without using the Supabase dashboard for day-to-day work.

## Public listings

Published properties are loaded from Supabase. Until the CMS is seeded, the site falls back to static data in `src/data/properties.js`.

Routes:

- `/buy` — `for_sale` + published
- `/rent` — `for_rent` + published
- `/sold` — `sold` + published
- `/rented` — `rented` + published

## Inquiries

The contact / inquiry form inserts into `public.inquiries` (optional `property_id`). Admins review them under **Admin → Enquiries**.
