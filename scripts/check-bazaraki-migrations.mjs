/**
 * Check whether Bazaraki-related Supabase columns exist (migrations applied).
 * Run: node scripts/check-bazaraki-migrations.mjs
 */
import {createClient} from '@supabase/supabase-js'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    try {
      const raw = readFileSync(resolve(process.cwd(), name), 'utf8')
      for (const line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = value
      }
    } catch {
      // optional file
    }
  }
}

loadEnv()

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env or .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, {auth: {persistSession: false}})

const checks = [
  {name: '20260827 publish_to_bazaraki', column: 'publish_to_bazaraki'},
  {name: '20260827 bazaraki_district_id', column: 'bazaraki_district_id'},
  {name: '20260828 bazaraki_must_haves', column: 'bazaraki_must_haves'},
  {name: '20260828 bazaraki_house_type', column: 'bazaraki_house_type'},
  {name: '20260829 land_type', column: 'land_type'},
]

let missing = 0

for (const {name, column} of checks) {
  const {error} = await supabase.from('properties').select(column).limit(1)
  if (error) {
    missing += 1
    console.log(`✗ ${name}: ${error.message}`)
  } else {
    console.log(`✓ ${name}`)
  }
}

const {error: settingsError} = await supabase
  .from('site_settings')
  .select('bazaraki_feed_enabled, bazaraki_rubric_plots_sale')
  .limit(1)
if (settingsError) {
  missing += 1
  console.log(`✗ site_settings bazaraki columns: ${settingsError.message}`)
} else {
  console.log('✓ 20260827 bazaraki_feed_enabled')
  console.log('✓ 20260829 bazaraki_rubric_plots_sale')
}

if (missing > 0) {
  console.log(`\n${missing} migration check(s) failed — run SQL files in supabase/migrations/`)
  process.exit(1)
}

console.log('\nAll Bazaraki migration checks passed.')
