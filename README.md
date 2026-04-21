# panos-real-estate-project

Premium luxury real estate frontend for Cyprus, built with React + Vite.

## Stack

- React
- Vite
- React Router
- Framer Motion
- Lucide React
- React Helmet Async

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Website inquiry API (Sanity CRM)

The contact form posts to `POST /api/inquiries`, which creates `_type: "inquiry"` documents in Sanity.

### Required server env vars

Set these in your deployment provider (for example Vercel project settings):

- `SANITY_API_WRITE_TOKEN` (required, server-side only)
- `SANITY_PROJECT_ID` (optional, defaults to `d7j11dpu`)
- `SANITY_DATASET` (optional, defaults to `production`)
- `SANITY_API_VERSION` (optional, defaults to `2024-01-01`)

Never expose `SANITY_API_WRITE_TOKEN` in client-side `VITE_*` variables.
