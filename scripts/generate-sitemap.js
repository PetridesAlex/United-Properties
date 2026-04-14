/**
 * Generates public/sitemap.xml for SEO.
 *
 * - Lists only canonical URLs (no client-only redirects to duplicate hubs).
 * - Merges static demo properties with Sanity CMS slugs when the API is reachable at build time.
 * - Optional: set SANITY_API_READ_TOKEN in the environment if your dataset requires a token for GROQ.
 *
 * @see https://www.sitemaps.org/protocol.html
 */
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {properties} from '../src/data/properties.js'

const SITE_URL = 'https://unitedproperties.eu'
const TODAY = new Date().toISOString().split('T')[0]

/** Match src/lib/sanityClient.js — used only for optional build-time property discovery */
const SANITY_PROJECT_ID = 'd7j11dpu'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2026-03-21'

/** Hub & marketing pages — unique content, stable priorities */
const staticRoutes = [
  {path: '/', changefreq: 'daily', priority: '1.0'},
  {path: '/properties', changefreq: 'weekly', priority: '0.9'},
  {path: '/buy', changefreq: 'weekly', priority: '0.9'},
  {path: '/rent', changefreq: 'weekly', priority: '0.9'},
  {path: '/new-developments', changefreq: 'weekly', priority: '0.85'},
  {path: '/featured-properties', changefreq: 'weekly', priority: '0.85'},
  {path: '/signature-listings', changefreq: 'weekly', priority: '0.85'},
  {path: '/about', changefreq: 'monthly', priority: '0.7'},
  {path: '/services', changefreq: 'monthly', priority: '0.7'},
  {path: '/developments', changefreq: 'weekly', priority: '0.8'},
  {path: '/agents', changefreq: 'monthly', priority: '0.75'},
  {path: '/contact', changefreq: 'monthly', priority: '0.75'},
]

/**
 * Region hubs that render real listing UI (see AppRouter).
 * Do NOT list /properties/paphos, nicosia, etc. — those redirect to /buy (duplicate canonical URL).
 */
const regionRoutes = [{path: '/properties/limassol', changefreq: 'weekly', priority: '0.85'}]

function buildUrl(pathname) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (normalizedPath === '/') return `${SITE_URL}/`
  return `${SITE_URL}${normalizedPath}`
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function createUrlEntry({loc, lastmod, changefreq, priority}) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${escapeXml(priority)}</priority>
  </url>`
}

function uniqueByLoc(entries) {
  const seen = new Set()
  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false
    seen.add(entry.loc)
    return true
  })
}

function getStaticPropertyEntries() {
  if (!Array.isArray(properties) || properties.length === 0) return []

  return properties
    .filter((property) => typeof property?.slug === 'string' && property.slug.trim().length > 0)
    .map((property) => ({
      loc: buildUrl(`/properties/${property.slug.trim()}`),
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.8',
    }))
}

/**
 * @returns {Promise<Array<{ slug: string, lastmod: string }>>}
 */
async function fetchSanityPropertyEntries() {
  const groq = `*[_type == "property" && defined(slug.current)]{"slug": slug.current, "_updatedAt": _updatedAt}`
  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`
  const url = `${base}?query=${encodeURIComponent(groq)}`

  const headers = {}
  const token = process.env.SANITY_API_READ_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(url, {headers})
    if (!res.ok) {
      console.warn(
        `[sitemap] Sanity GROQ returned ${res.status} ${res.statusText}. Using static property URLs only.`,
      )
      return []
    }
    const data = await res.json()
    const rows = Array.isArray(data?.result) ? data.result : []
    return rows
      .filter((row) => typeof row?.slug === 'string' && row.slug.trim().length > 0)
      .map((row) => {
        const lastmod =
          typeof row._updatedAt === 'string' && row._updatedAt.includes('T')
            ? row._updatedAt.split('T')[0]
            : TODAY
        return {slug: row.slug.trim(), lastmod}
      })
  } catch (err) {
    console.warn('[sitemap] Sanity fetch failed:', err?.message || err)
    return []
  }
}

function mergePropertyEntries(staticEntries, sanityRows) {
  const bySlug = new Map()

  for (const e of staticEntries) {
    const slug = e.loc.replace(`${SITE_URL}/properties/`, '').replace(/\/$/, '')
    bySlug.set(slug, {...e})
  }

  for (const row of sanityRows) {
    bySlug.set(row.slug, {
      loc: buildUrl(`/properties/${row.slug}`),
      lastmod: row.lastmod,
      changefreq: 'weekly',
      priority: '0.8',
    })
  }

  return [...bySlug.values()]
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const pa = parseFloat(a.priority)
    const pb = parseFloat(b.priority)
    if (pb !== pa) return pb - pa
    return a.loc.localeCompare(b.loc, 'en')
  })
}

async function generateSitemapXml() {
  const sanityRows = await fetchSanityPropertyEntries()
  if (sanityRows.length > 0) {
    console.log(`[sitemap] Sanity: ${sanityRows.length} property URL(s) merged into sitemap.`)
  }

  const staticPropertyEntries = getStaticPropertyEntries()
  const propertyEntries = mergePropertyEntries(staticPropertyEntries, sanityRows)

  const hubEntries = [
    ...staticRoutes.map((route) => ({
      loc: buildUrl(route.path),
      lastmod: TODAY,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    ...regionRoutes.map((route) => ({
      loc: buildUrl(route.path),
      lastmod: TODAY,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    ...propertyEntries,
  ]

  const uniqueEntries = uniqueByLoc(hubEntries)
  const sorted = sortEntries(uniqueEntries)
  const xmlEntries = sorted.map(createUrlEntry).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- United Properties — generated by scripts/generate-sitemap.js (do not edit by hand) -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlEntries}
</urlset>
`
}

async function writeSitemap() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const outputPath = path.resolve(__dirname, '../public/sitemap.xml')
  const publicDir = path.dirname(outputPath)

  fs.mkdirSync(publicDir, {recursive: true})
  const xml = await generateSitemapXml()
  fs.writeFileSync(outputPath, xml, 'utf8')

  console.log(`Sitemap generated at ${outputPath} (${(xml.match(/<url>/g) || []).length} URLs)`)
}

writeSitemap().catch((err) => {
  console.error(err)
  process.exit(1)
})
