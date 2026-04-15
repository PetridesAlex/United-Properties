/**
 * Generates public/sitemap.xml for SEO.
 *
 * - Canonical host: https://www.unitedproperties.eu (match Google Search Console property).
 * - Minimal valid XML: urlset + loc only (sitemaps.org).
 * - Property URLs from Sanity GROQ when fetch succeeds (no demo slugs).
 *
 * Optional: SANITY_API_READ_TOKEN if the dataset requires it.
 *
 * @see https://www.sitemaps.org/protocol.html
 */
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const SITE_URL = 'https://www.unitedproperties.eu'

/** Match src/lib/sanityClient.js — build-time property discovery */
const SANITY_PROJECT_ID = 'd7j11dpu'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2026-03-21'

/**
 * Ordered hub URLs. Only one “developments” listing (/developments); /new-developments is omitted from sitemap to avoid duplicate discovery.
 */
const STATIC_PATHS = [
  '/',
  '/buy',
  '/rent',
  '/contact',
  '/properties',
  '/featured-properties',
  '/signature-listings',
  '/about',
  '/services',
  '/developments',
  '/agents',
]

/** Region hubs only (no duplicate region redirects). */
const REGION_PATHS = ['/properties/limassol']

/**
 * Property slugs to omit from the sitemap (demo data, typos, or removed listings still in CMS).
 * Fix or unpublish in Sanity, then remove from this list when URLs are valid again.
 */
const EXCLUDED_PROPERTY_SLUGS = new Set([
  '2-bedroom-flat',
  '3-bedroom-city-apartmen',
])

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

function createUrlEntry(loc) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
  </url>`
}

function uniquePreserveOrder(urls) {
  const seen = new Set()
  return urls.filter((u) => {
    if (seen.has(u)) return false
    seen.add(u)
    return true
  })
}

/**
 * @returns {Promise<Array<{ slug: string }>>}
 */
async function fetchSanityPropertySlugs() {
  const groq = `*[_type == "property" && defined(slug.current)]{"slug": slug.current}`
  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`
  const url = `${base}?query=${encodeURIComponent(groq)}`

  const headers = {}
  const token = process.env.SANITY_API_READ_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(url, {headers})
    if (!res.ok) {
      console.warn(`[sitemap] Sanity GROQ returned ${res.status} ${res.statusText}.`)
      return []
    }
    const data = await res.json()
    const rows = Array.isArray(data?.result) ? data.result : []
    const trimmed = rows
      .filter((row) => typeof row?.slug === 'string' && row.slug.trim().length > 0)
      .map((row) => row.slug.trim())
    const excluded = trimmed.filter((slug) => EXCLUDED_PROPERTY_SLUGS.has(slug))
    if (excluded.length > 0) {
      console.log(`[sitemap] Excluded ${excluded.length} property slug(s) from sitemap: ${excluded.join(', ')}`)
    }
    return trimmed
      .filter((slug) => !EXCLUDED_PROPERTY_SLUGS.has(slug))
      .map((slug) => ({slug}))
  } catch (err) {
    console.warn('[sitemap] Sanity fetch failed:', err?.message || err)
    return []
  }
}

async function generateSitemapXml() {
  const sanitySlugs = await fetchSanityPropertySlugs()
  if (sanitySlugs.length === 0) {
    console.warn('[sitemap] No property listing URLs in sitemap (exclusions only, or Sanity fetch empty/failed).')
  } else {
    console.log(`[sitemap] ${sanitySlugs.length} property listing URL(s) in sitemap.`)
  }

  const propertyUrls = sanitySlugs
    .sort((a, b) => a.slug.localeCompare(b.slug, 'en'))
    .map((row) => buildUrl(`/properties/${row.slug}`))

  const urls = uniquePreserveOrder([
    ...STATIC_PATHS.map((p) => buildUrl(p)),
    ...REGION_PATHS.map((p) => buildUrl(p)),
    ...propertyUrls,
  ])

  const xmlEntries = urls.map(createUrlEntry).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
