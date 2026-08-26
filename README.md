# panos-real-estate-project

Premium luxury real estate frontend for Cyprus, built with React + Vite.

## Stack

- React
- Vite
- React Router
- Framer Motion
- Lucide React
- React Helmet Async
- Supabase (optional — inquiries)

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` → `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (anon / public JWT only)

Restart the dev server after changing `.env`.

## Build

```bash
npm run build
```

## Content

Listings and agents come from static data in `src/data/`.

## Inquiries (Supabase)

The contact / inquiry form inserts into `public.inquiries` when Supabase env vars are set.

1. Open Supabase → **SQL Editor**
2. Run [`supabase/inquiries.sql`](supabase/inquiries.sql) (creates table + insert policy)
3. Submit a test inquiry on the site, then check **Table Editor → inquiries**

If the table/policy is missing, the form falls back to `mailto:` using `VITE_CONTACT_EMAIL`.
