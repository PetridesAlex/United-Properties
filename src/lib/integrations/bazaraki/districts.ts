import districtsData from './data/districts.json'

export interface BazarakiRegion {
  id: number
  name: string
  slug: string
}

export interface BazarakiCity {
  id: number
  name: string
  regionId: number
  regionName: string
}

export interface BazarakiDistrict {
  id: number
  name: string
  slug: string
  cityName: string
  cityId: number
  regionName: string
  regionId: number
  areaName: string
  postCodes: number[]
}

interface RawCityDistrict {
  id: number
  name: string
  slug: string
  post_codes?: number[]
  city?: {name: string; id: number}
}

interface RawCity {
  id: number
  name: string
  slug: string
  city_districts?: RawCityDistrict[]
}

export function formatAreaName(rawName: string, cityName: string): string {
  const prefix = `${cityName} - `
  if (rawName.startsWith(prefix)) return rawName.slice(prefix.length)
  return rawName
}

function flattenDistricts(): BazarakiDistrict[] {
  const results = (districtsData as {results?: RawCity[]}).results ?? []
  const out: BazarakiDistrict[] = []
  for (const region of results) {
    for (const d of region.city_districts ?? []) {
      const cityName = d.city?.name ?? region.name
      out.push({
        id: d.id,
        name: d.name,
        slug: d.slug,
        cityName,
        cityId: d.city?.id ?? region.id,
        regionName: region.name,
        regionId: region.id,
        areaName: formatAreaName(d.name, cityName),
        postCodes: d.post_codes ?? [],
      })
    }
  }
  return out.sort((a, b) => a.areaName.localeCompare(b.areaName, 'en'))
}

const ALL_DISTRICTS = flattenDistricts()
const REGIONS: BazarakiRegion[] = ((districtsData as {results?: RawCity[]}).results ?? []).map(
  (region) => ({
    id: region.id,
    name: region.name,
    slug: region.slug,
  }),
)

const CITIES_BY_REGION = new Map<number, BazarakiCity[]>()
for (const region of REGIONS) {
  const cities = new Map<number, BazarakiCity>()
  for (const d of ALL_DISTRICTS) {
    if (d.regionId !== region.id) continue
    if (!cities.has(d.cityId)) {
      cities.set(d.cityId, {
        id: d.cityId,
        name: d.cityName,
        regionId: region.id,
        regionName: region.name,
      })
    }
  }
  CITIES_BY_REGION.set(
    region.id,
    [...cities.values()].sort((a, b) => a.name.localeCompare(b.name, 'en')),
  )
}

export function getBazarakiRegions(): BazarakiRegion[] {
  return REGIONS
}

export function getBazarakiRegionById(id: number | null | undefined): BazarakiRegion | null {
  if (id == null) return null
  return REGIONS.find((r) => r.id === id) ?? null
}

export function getBazarakiRegionByName(name: string | null | undefined): BazarakiRegion | null {
  const q = name?.trim().toLowerCase()
  if (!q) return null
  return REGIONS.find((r) => r.name.toLowerCase() === q) ?? null
}

export function getCitiesForRegion(regionId: number | null | undefined): BazarakiCity[] {
  if (regionId == null) return []
  return CITIES_BY_REGION.get(regionId) ?? []
}

export function getAreasForRegion(
  regionId: number | null | undefined,
  cityName?: string | null,
): BazarakiDistrict[] {
  if (regionId == null) return []
  const city = cityName?.trim().toLowerCase()
  return ALL_DISTRICTS.filter((d) => {
    if (d.regionId !== regionId) return false
    if (city && d.cityName.toLowerCase() !== city) return false
    return true
  })
}

export function getAllBazarakiDistricts(): BazarakiDistrict[] {
  return ALL_DISTRICTS
}

export function getBazarakiDistrictById(id: number | null | undefined): BazarakiDistrict | null {
  if (id == null) return null
  return ALL_DISTRICTS.find((d) => d.id === id) ?? null
}

export function resolveBazarakiLocation(districtId: number | null | undefined): {
  region: BazarakiRegion
  city: BazarakiCity
  district: BazarakiDistrict
} | null {
  const district = getBazarakiDistrictById(districtId)
  if (!district) return null
  const region = getBazarakiRegionById(district.regionId)
  const city = getCitiesForRegion(district.regionId).find((c) => c.id === district.cityId)
  if (!region || !city) return null
  return {region, city, district}
}

export function searchBazarakiDistricts(
  query: string,
  limit = 20,
  regionId?: number | null,
  cityName?: string | null,
): BazarakiDistrict[] {
  const pool =
    regionId != null ? getAreasForRegion(regionId, cityName) : ALL_DISTRICTS.slice()
  const q = query.trim().toLowerCase()
  if (!q) return pool.slice(0, limit)

  const scored = pool
    .map((d) => {
      const label = `${d.areaName} ${d.name} ${d.cityName} ${d.regionName}`.toLowerCase()
      const slug = d.slug.toLowerCase()
      let score = 0
      if (d.areaName.toLowerCase().startsWith(q)) score += 12
      if (label.startsWith(q)) score += 10
      else if (label.includes(q)) score += 5
      if (slug.includes(q.replace(/\s+/g, '-'))) score += 3
      if (d.postCodes.some((pc) => String(pc).startsWith(q))) score += 8
      return {d, score}
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.d.areaName.localeCompare(b.d.areaName, 'en'))

  return scored.slice(0, limit).map((x) => x.d)
}

export function formatDistrictLabel(d: BazarakiDistrict): string {
  return `${d.areaName} (${d.cityName}, ${d.regionName})`
}

export function toCmsLocationFields(d: BazarakiDistrict): {
  district: string
  city: string
  area: string
  bazarakiDistrictId: number
} {
  return {
    district: d.regionName,
    city: d.cityName,
    area: d.areaName,
    bazarakiDistrictId: d.id,
  }
}
