/**
 * Downloads Bazaraki districts JSON for the admin district picker.
 * Run: node scripts/fetch-bazaraki-districts.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const SOURCE_URL = 'https://www.bazaraki.com/api/items/all_cities_districts/'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATH = path.resolve(
  __dirname,
  '../src/lib/integrations/bazaraki/data/districts.json',
)

async function main() {
  console.log(`Fetching ${SOURCE_URL}…`)
  const res = await fetch(SOURCE_URL)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  fs.mkdirSync(path.dirname(OUT_PATH), {recursive: true})
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), 'utf8')
  const count = data.results?.reduce(
    (n, city) => n + (city.city_districts?.length ?? 0),
    0,
  )
  console.log(`Wrote ${OUT_PATH} (${count ?? '?'} districts)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
