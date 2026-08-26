/** Shared Bazaraki attr key mappers used across category schemas. */

export const BAZARAKI_CONDITION_MAP: Record<string, number> = {
  'Brand new': 10,
  'brand new': 10,
  Resale: 20,
  resale: 20,
  'Under construction': 30,
  'under construction': 30,
}

export const BAZARAKI_ENERGY_MAP: Record<string, number> = {
  A: 10,
  'B+': 15,
  B: 20,
  C: 30,
  D: 40,
  E: 50,
  F: 60,
  G: 70,
  'N/A': 80,
  NA: 80,
  'In Progress': 90,
  'in progress': 90,
}

export const BAZARAKI_FURNISHING_MAP: Record<string, number> = {
  'Fully Furnished': 1,
  'Semi-Furnished': 2,
  Unfurnished: 3,
  'Appliances only': 4,
  'Appliances οnly': 4,
}

export const BAZARAKI_MUST_HAVE_LABELS: Record<number, string> = {
  1: 'Pool',
  2: 'Garden',
  3: 'Parking',
  4: 'Elevator',
  5: 'Alarm',
  6: 'Fireplace',
  7: 'Balcony',
  8: 'Playroom',
  9: 'Attic/Loft',
  10: 'Storage room',
}

/** Apartment + houses must-haves (no Parking #3). */
export const MUST_HAVES_WITHOUT_PARKING = [1, 2, 4, 5, 6, 7, 8, 9, 10] as const

/** Residential + commercial must-haves (includes Parking #3). */
export const MUST_HAVES_WITH_PARKING = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

const FEATURE_KEYWORDS: Record<number, string[]> = {
  1: ['pool', 'swimming pool'],
  2: ['garden'],
  3: ['parking', 'garage', 'car park'],
  4: ['elevator', 'lift'],
  5: ['alarm'],
  6: ['fireplace'],
  7: ['balcony'],
  8: ['playroom', 'play room'],
  9: ['attic', 'loft'],
  10: ['storage'],
}

export function mapConditionToBazaraki(value: string | null | undefined): number | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  return BAZARAKI_CONDITION_MAP[trimmed] ?? null
}

export function mapEnergyEfficiencyToBazaraki(value: string | null | undefined): number | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  return BAZARAKI_ENERGY_MAP[trimmed] ?? null
}

export function mapFurnishingToBazaraki(value: string | null | undefined): number | null {
  if (!value?.trim()) return null
  return BAZARAKI_FURNISHING_MAP[value.trim()] ?? null
}

export function mapConstructionYear(yearBuilt: number | null | undefined): number | null {
  if (yearBuilt == null) return null
  if (yearBuilt >= 1994 && yearBuilt <= 2026) return yearBuilt
  if (yearBuilt < 1994) return 300
  return null
}

export function mapOnlineViewing(enabled: boolean | null | undefined): 10 | 20 {
  return enabled ? 10 : 20
}

export function resolveArea(
  internalArea: number | null | undefined,
  coveredArea: number | null | undefined,
): number | null {
  const area = internalArea ?? coveredArea
  if (area == null || area <= 0) return null
  return Math.round(area)
}

export function formatPostalCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/\D/g, '')
  return digits || trimmed
}

export function mapFloorToBazaraki(floor: number | null | undefined): number | null {
  if (floor == null || floor < 0) return null
  if (floor === 0) return 10
  if (floor >= 8) return 90
  return 10 + floor * 10
}

export function mapBedroomsApartment(count: number | null | undefined): number | null {
  if (count == null || count < 0) return null
  if (count >= 6) return 6
  return count
}

export function mapBedroomsHouses(count: number | null | undefined): number | null {
  if (count == null || count < 0) return null
  if (count >= 10) return 10
  return count
}

export function mapBathrooms(count: number | null | undefined): number | null {
  if (count == null || count < 1) return null
  if (count >= 5) return 5
  return count
}

export function mapAirConditioningLevel(value: number | null | undefined): 1 | 2 | 3 | null {
  if (value === 1 || value === 2 || value === 3) return value
  return null
}

export function mapParkingLevel(value: number | null | undefined): 1 | 2 | 3 | null {
  if (value === 1 || value === 2 || value === 3) return value
  return null
}

export function mapPetsLevel(value: number | null | undefined): 1 | 2 | null {
  if (value === 1 || value === 2) return value
  return null
}

export function hasFeature(features: string[] | null | undefined, ...keywords: string[]): boolean {
  if (!features?.length) return false
  const haystack = features.join(' ').toLowerCase()
  return keywords.some((kw) => haystack.includes(kw.toLowerCase()))
}

export function deriveMustHaves(
  features: string[] | null | undefined,
  explicit: number[] | null | undefined,
  allowedIds: readonly number[],
): string | null {
  const ids = new Set<number>()
  for (const id of explicit ?? []) {
    if (allowedIds.includes(id)) ids.add(id)
  }
  if (features?.length) {
    for (const id of allowedIds) {
      const keywords = FEATURE_KEYWORDS[id]
      if (keywords && hasFeature(features, ...keywords)) ids.add(id)
    }
  }
  if (!ids.size) return null
  return [...ids].sort((a, b) => a - b).join(',')
}

export function inferAirConditioningFromFeatures(
  features: string[] | null | undefined,
): 1 | 2 | 3 {
  if (hasFeature(features, 'air conditioning', 'air-conditioning', 'a/c', 'ac', 'climate')) {
    return 1
  }
  return 3
}

export function inferParkingFromProperty(
  parkingSpaces: number | null | undefined,
  features: string[] | null | undefined,
): 1 | 2 | 3 {
  if ((parkingSpaces != null && parkingSpaces > 0) || hasFeature(features, 'parking', 'garage')) {
    return 2
  }
  return 3
}
