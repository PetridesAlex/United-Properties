# United Properties — Sanity Studio

CMS + mini-CRM for United Properties (`projectId` / `dataset` live in [`sanity.config.ts`](sanity.config.ts)).

## Seeing your latest Studio changes

Editing files in this repo **does not** update **https://unitedproperties-eu.sanity.studio** until you deploy.

| Goal | What to run |
|------|----------------|
| **Preview latest code on your machine** | From `ENTER/`: `npm install` then `npm run dev` → open the URL shown (often `http://localhost:3333`). Log in with an account that has access to project `d7j11dpu`. |
| **Publish the same Studio for everyone (hosted URL)** | From `ENTER/`: `npm run build` then `sanity deploy` (requires `sanity login` once). After deploy finishes, reload the hosted Studio (hard refresh: Cmd+Shift+R). |

If the tool switcher still shows only “Structure” and old desk: you were almost certainly still on an **old deploy**. Redeploy or use **`sanity dev`** locally.

## Content model

Document types include **property** (purpose + listing status + references to **city** and **agent**), **inquiry**, **agent**, **city**, **testimonial**, and singleton **siteSettings**. Property descriptions use portable text with a legacy plain-text field for migrated copy.

Custom tools in the Studio:

- **Overview** — metrics and recent inquiries/properties.
- **Lead board** — inquiries by status (drag-and-drop columns).

## Vision: Leads report query

Use this in **Vision** (`http://localhost:3333/vision` locally, or hosted Vision tab) to get a compact CRM report:

```groq
{
  "summary": {
    "total": count(*[_type == "inquiry"]),
    "new": count(*[_type == "inquiry" && status == "new"]),
    "contacted": count(*[_type == "inquiry" && status == "contacted"]),
    "followUp": count(*[_type == "inquiry" && status == "follow_up"]),
    "viewingScheduled": count(*[_type == "inquiry" && status == "viewing_scheduled"]),
    "negotiation": count(*[_type == "inquiry" && status == "negotiation"]),
    "closed": count(*[_type == "inquiry" && status == "closed"]),
    "lost": count(*[_type == "inquiry" && status == "lost"]),
    "highPriorityOpen": count(*[
      _type == "inquiry" &&
      priority == "high" &&
      !(status in ["closed", "lost"])
    ])
  },
  "next7DaysFollowUps": *[
    _type == "inquiry" &&
    defined(followUpDate) &&
    followUpDate >= now() &&
    followUpDate < dateTime(now()) + 60 * 60 * 24 * 7
  ] | order(followUpDate asc){
    _id,
    fullName,
    email,
    phone,
    status,
    priority,
    followUpDate,
    "propertyTitle": property->title,
    "assignedAgent": assignedAgent->name
  },
  "recentLeads": *[_type == "inquiry"] | order(_createdAt desc)[0...20]{
    _id,
    _createdAt,
    fullName,
    email,
    phone,
    status,
    priority,
    inquiryType,
    "propertyTitle": property->title,
    "assignedAgent": assignedAgent->name
  }
}
```

Tip: the same query is exported as `LEADS_REPORT_QUERY` in [`lib/queries.ts`](lib/queries.ts) for reuse in custom tools.

## Vision: Leads by agent workload

Use this in Vision to see assignment coverage, per-agent pipeline counts, and recent unassigned leads:

```groq
{
  "totals": {
    "allLeads": count(*[_type == "inquiry"]),
    "assignedLeads": count(*[_type == "inquiry" && defined(assignedAgent)]),
    "unassignedLeads": count(*[_type == "inquiry" && !defined(assignedAgent)])
  },
  "agents": *[_type == "agent"] | order(name asc){
    _id,
    name,
    email,
    phone,
    "leadCounts": {
      "total": count(*[_type == "inquiry" && assignedAgent._ref == ^._id]),
      "open": count(*[
        _type == "inquiry" &&
        assignedAgent._ref == ^._id &&
        !(status in ["closed", "lost"])
      ]),
      "highPriorityOpen": count(*[
        _type == "inquiry" &&
        assignedAgent._ref == ^._id &&
        priority == "high" &&
        !(status in ["closed", "lost"])
      ]),
      "new": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "new"]),
      "contacted": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "contacted"]),
      "followUp": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "follow_up"]),
      "viewingScheduled": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "viewing_scheduled"]),
      "negotiation": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "negotiation"]),
      "closed": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "closed"]),
      "lost": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "lost"])
    },
    "nextFollowUps": *[
      _type == "inquiry" &&
      assignedAgent._ref == ^._id &&
      defined(followUpDate)
    ] | order(followUpDate asc)[0...5]{
      _id,
      fullName,
      status,
      priority,
      followUpDate,
      "propertyTitle": property->title
    }
  },
  "unassignedRecent": *[
    _type == "inquiry" &&
    !defined(assignedAgent)
  ] | order(_createdAt desc)[0...20]{
    _id,
    _createdAt,
    fullName,
    email,
    phone,
    status,
    priority,
    followUpDate,
    "propertyTitle": property->title
  }
}
```

Tip: this query is exported as `LEADS_BY_AGENT_QUERY` in [`lib/queries.ts`](lib/queries.ts).

## Migrating legacy property documents

Older listings used a single `status` field (`for-sale`, `for-rent`, `sold`, `reserved`). Run the migration script **once** against your dataset **after** deploying the new schema (from repo root):

```bash
SANITY_API_WRITE_TOKEN="sk…" node scripts/migrate-sanity-properties.mjs
SANITY_API_WRITE_TOKEN="sk…" node scripts/migrate-sanity-properties.mjs --dry-run
```

This maps legacy values to `purpose` + `listingStatus`, copies plain `description` into `legacyDescriptionPlain` where needed, and fills top-level coordinates from legacy `geometry` when latitude/longitude are missing.

Do **not** expose this token in client-side code or commit it.

## Website: creating inquiries safely

Public sites must **not** bundle a Sanity write token.

Recommended pattern:

1. Add a **serverless** route (e.g. Vercel `/api/inquiries`, Netlify Function, Cloudflare Worker) that validates the POST body (e.g. with Zod).
2. Instantiate `@sanity/client` with `SANITY_API_WRITE_TOKEN` available only on the server (`process.env`).
3. Call `client.create({ _type: 'inquiry', ...payload })` with fields that match [`schemaTypes/documents/inquiry.ts`](schemaTypes/documents/inquiry.ts).
4. Optionally add rate limiting + honeypot + CAPTCHA on the form.

Optional: Sanity **webhook** on document create → email (SendGrid/Resend) or Slack — configure in https://manage.sanity.io → API → Webhooks.

## Dataset privacy

Editors with Studio access can open CRM documents. For stricter separation (e.g. confidential notes), consider a dedicated dataset or document-level permissions where your Sanity plan supports it.

## Sanity resources

- [Getting started](https://www.sanity.io/docs/introduction/getting-started)
- [Extend the Studio](https://www.sanity.io/docs/content-studio/extending)
