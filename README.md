# United Properties

Public website for [United Properties](https://www.unitedproperties.eu) — luxury real estate in Cyprus — plus a Supabase-powered CMS at `/admin`.

**Live site:** https://www.unitedproperties.eu  
**Repo:** https://github.com/PetridesAlex/United-Properties

## Stack

| Area | Choice |
|---|---|
| App | React **19.2** + Vite **8** |
| Public pages | JSX (`.jsx`) |
| Admin / CMS | TypeScript (`.tsx`) where needed |
| Routing | `react-router-dom` **v7** (`BrowserRouter` + `<Routes>`) |
| Styling | **Plain CSS** files next to components/pages — no Tailwind, no CSS Modules, no Sass, no styled-components |
| Global tokens | `src/styles/variables.css`, `globals.css`, `utilities.css` |
| Fonts | Cormorant Garamond + Montserrat (Google Fonts in `index.html`) |
| Motion | Framer Motion / Motion, GSAP |
| Maps | Leaflet (offices map); Google Maps API for listings |
| Backend / CMS | Supabase (Auth, Postgres, Storage) |
| Hosting | Vercel |

Class naming is BEM-style with project prefixes (e.g. `.up-contact`, `.up-fab`, `.up-ticker`).

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173/

### Environment variables

Copy `.env.example` → `.env` and set at least:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` — **anon / public JWT only** (never a service-role key in `VITE_*`)
- `VITE_GOOGLE_MAPS_API_KEY` — for listing maps (enable Maps JavaScript API; restrict by HTTP referrer)

Optional contact overrides (defaults live in `src/config/externalLinks.js`):

- `VITE_WHATSAPP_URL`
- `VITE_TELEGRAM_URL`
- `VITE_CONTACT_PHONE_TEL`
- `VITE_CONTACT_EMAIL`

Restart the dev server after changing `.env`. On Vercel, set the same variables for Production + Preview, then redeploy.

## Public routes

| Path | Page |
|---|---|
| `/` | Home |
| `/buy`, `/rent`, `/sold`, `/rented` | Property listings |
| `/properties`, `/properties/:slug` | All listings / property detail |
| `/search` | Search |
| `/services` | United Services |
| `/about` | About |
| `/contact` | Contact |
| `/agents` | Agents |
| `/sell-with-us`, `/concierge` | Lead / service pages |
| `/privacy` | Privacy |

Published listings load from Supabase. Until the CMS is seeded, the site can fall back to static data in `src/data/properties.js`.

## Database setup

1. Open Supabase → **SQL Editor**
2. Run migrations in order under `supabase/migrations/` (start with `20260826_001_cms_schema.sql`, then later Bazaraki / CRM files as needed)
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
SEED_ACCESS_TOKEN=<admin_access_token> npm run seed:properties
```

## CMS (`/admin`)

Staff manage properties, images, website content, settings, enquiries, clients/CRM, and Bazaraki without using the Supabase dashboard for day-to-day work.

## Bazaraki XML feed

Properties marked **Publish to Bazaraki** with a valid district, postal code, and readiness checks appear in:

**Feed URL:** https://www.unitedproperties.eu/api/bazaraki.xml

1. Run the Bazaraki-related migrations in Supabase SQL Editor:
   - `supabase/migrations/20260827_bazaraki_fields.sql`
   - `supabase/migrations/20260828_bazaraki_category_fields.sql`
   - `supabase/migrations/20260829_land_property_fields.sql`
2. Configure per-category rubric IDs under **Admin → Settings → Bazaraki integration**
3. On each property, set **Bazaraki district**, **Postal code**, and category fields when publishing
4. Register the feed URL in [Bazaraki profile settings](https://www.bazaraki.com/profile/settings/)

```bash
npm run fetch:bazaraki-districts   # optional district refresh
npm run test:bazaraki              # smoke-test XML formatters
```

## Build / checks

```bash
npm run build
npm run typecheck
npm run lint
```

`npm run build` also regenerates the sitemap and the Bazaraki API bundle.

## Contributing (PRs)

Collaborators: please open a **pull request** against `main` rather than pushing straight to production.

1. Branch from latest `main`
2. Match existing patterns: React component + co-located plain `.css` file; reuse `src/config/externalLinks.js` for contact links where possible
3. Keep branded page CSS consistent with existing United pages (`.up-*` prefixes, Cormorant / Montserrat)
4. Do not commit `.env`, secrets, or service-role keys
5. Open a PR with a short summary and test notes; wait for review before merge

Vercel deploys from `main` to production automatically after merge.
