/**
 * Seed Supabase properties from static src/data/properties.js
 *
 * Usage (with service role OR as an already-activated admin session is NOT supported here —
 * this script uses the anon key and requires an admin JWT via env):
 *
 *   SEED_ACCESS_TOKEN=<user_access_token> node scripts/seed-properties-from-static.mjs
 *
 * Or paste/run SQL inserts manually after creating an admin user.
 *
 * Prefer: sign in as admin in the CMS and recreate listings, OR run migration then
 * use this script with a user access token from the browser session.
 */
import {createClient} from '@supabase/supabase-js'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  try {
    const raw = readFileSync(join(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const s = line.trim()
      if (!s || s.startsWith('#') || !s.includes('=')) continue
      const [k, ...rest] = s.split('=')
      if (!process.env[k]) process.env[k] = rest.join('=').trim()
    }
  } catch {
    // ignore
  }
}

loadEnv()

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY
const token = process.env.SEED_ACCESS_TOKEN

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}
if (!token) {
  console.error('Set SEED_ACCESS_TOKEN to an authenticated admin access token to seed.')
  process.exit(1)
}

const {properties} = await import('../src/data/properties.js')

const supabase = createClient(url, anon, {
  global: {headers: {Authorization: `Bearer ${token}`}},
})

function statusToDb(status) {
  if (status === 'For Rent') return 'for_rent'
  if (status === 'Sold') return 'sold'
  if (status === 'Rented') return 'rented'
  return 'for_sale'
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

for (const item of properties) {
  const slug = item.slug || slugify(item.title)
  const {data: existing} = await supabase.from('properties').select('id').eq('slug', slug).maybeSingle()
  if (existing) {
    console.log('skip existing', slug)
    continue
  }

  const {data: created, error} = await supabase
    .from('properties')
    .insert({
      slug,
      title: item.title,
      short_description: item.description?.slice(0, 180) || null,
      description: item.description || null,
      status: statusToDb(item.status),
      property_type: item.type || null,
      price: item.price ?? null,
      currency: 'EUR',
      city: item.location || null,
      bedrooms: item.bedrooms ?? null,
      bathrooms: item.bathrooms ?? null,
      internal_area: item.sqm ?? null,
      plot_size: item.plotSize ?? null,
      year_built: item.yearBuilt ?? null,
      parking_spaces: item.parking ?? null,
      features: item.features || [],
      featured: Boolean(item.featured),
      published: true,
      publish_to_bazaraki: false,
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('insert failed', slug, error.message)
    continue
  }

  const gallery = [item.image, ...(item.gallery || [])].filter(Boolean)
  const unique = [...new Set(gallery)]
  if (unique.length) {
    const rows = unique.map((image_url, position) => ({
      property_id: created.id,
      image_url,
      storage_path: null,
      alt_text: item.title,
      position,
      is_featured: position === 0,
    }))
    const {error: imgErr} = await supabase.from('property_images').insert(rows)
    if (imgErr) console.error('images failed', slug, imgErr.message)
  }

  console.log('seeded', slug)
}

console.log('Done.')
