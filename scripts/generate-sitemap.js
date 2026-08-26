/**
 * Generates public/sitemap.xml for SEO.
 *
 * - Canonical host: https://www.unitedproperties.eu
 * - Static hub URLs + property listing URLs from src/data/properties.js
 *
 * @see https://www.sitemaps.org/protocol.html
 */
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const SITE_URL = 'https://www.unitedproperties.eu'

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
  '/sell-with-us',
  '/concierge',
  '/agents',
]

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

async function loadPropertySlugs() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const dataPath = path.resolve(__dirname, '../src/data/properties.js')
  const mod = await import(pathToFileURL(dataPath).href)
  const list = Array.isArray(mod.properties) ? mod.properties : []
  return list
    .map((row) => (typeof row?.slug === 'string' ? row.slug.trim() : ''))
    .filter(Boolean)
}

async function generateSitemapXml() {
  const slugs = await loadPropertySlugs()
  console.log(`[sitemap] ${slugs.length} property listing URL(s) from static data.`)

  const propertyUrls = [...slugs]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((slug) => buildUrl(`/properties/${slug}`))

  const urls = uniquePreserveOrder([
    ...STATIC_PATHS.map((p) => buildUrl(p)),
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
