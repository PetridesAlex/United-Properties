import districtsData from './data/districts.json'

export interface BazarakiDistrict {
  id: number
  name: string
  slug: string
  cityName: string
  cityId: number
  postCodes: number[]
}

interface RawCity {
  id: number
  name: string
  city_districts?: {
    id: number
    name: string
    slug: string
    post_codes?: number[]
    city?: {name: string; id: number}
  }[]
}

function flattenDistricts(): BazarakiDistrict[] {
  const results = (districtsData as {results?: RawCity[]}).results ?? []
  const out: BazarakiDistrict[] = []
  for (const city of results) {
    for (const d of city.city_districts ?? []) {
      out.push({
        id: d.id,
        name: d.name,
        slug: d.slug,
        cityName: d.city?.name ?? city.name,
        cityId: d.city?.id ?? city.id,
        postCodes: d.post_codes ?? [],
      })
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, 'en'))
}

const ALL_DISTRICTS = flattenDistricts()

export function getAllBazarakiDistricts(): BazarakiDistrict[] {
  return ALL_DISTRICTS
}

export function getBazarakiDistrictById(id: number | null | undefined): BazarakiDistrict | null {
  if (id == null) return null
  return ALL_DISTRICTS.find((d) => d.id === id) ?? null
}

export function searchBazarakiDistricts(query: string, limit = 20): BazarakiDistrict[] {
  const q = query.trim().toLowerCase()
  if (!q) return ALL_DISTRICTS.slice(0, limit)

  const scored = ALL_DISTRICTS.map((d) => {
    const label = `${d.name} ${d.cityName}`.toLowerCase()
    const slug = d.slug.toLowerCase()
    let score = 0
    if (label.startsWith(q)) score += 10
    else if (label.includes(q)) score += 5
    if (slug.includes(q.replace(/\s+/g, '-'))) score += 3
    if (d.postCodes.some((pc) => String(pc).startsWith(q))) score += 8
    return {d, score}
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.d.name.localeCompare(b.d.name, 'en'))

  return scored.slice(0, limit).map((x) => x.d)
}

export function formatDistrictLabel(d: BazarakiDistrict): string {
  return `${d.name} (${d.cityName})`
}
