export type MapCoordinateSource = 'pin' | 'district' | 'area' | 'city'

export type ResolvedMapCoordinates = {
  latitude: number
  longitude: number
  source: MapCoordinateSource
}

const CITY_CENTERS: Record<string, {latitude: number; longitude: number}> = {
  limassol: {latitude: 34.7071, longitude: 33.0226},
  nicosia: {latitude: 35.1856, longitude: 33.3823},
  paphos: {latitude: 34.772, longitude: 32.4297},
  larnaca: {latitude: 34.9003, longitude: 33.6232},
  protaras: {latitude: 35.0125, longitude: 34.0582},
  'ayia napa': {latitude: 34.988, longitude: 34.0018},
  'agia napa': {latitude: 34.988, longitude: 34.0018},
  famagusta: {latitude: 35.1264, longitude: 33.941},
}

function isValidCoord(lat: unknown, lng: unknown): lat is number {
  const latitude = typeof lat === 'number' ? lat : Number(lat)
  const longitude = typeof lng === 'number' ? lng : Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false
  if (latitude === 0 && longitude === 0) return false
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false
  return true
}

function norm(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

/** Resolve a public map pin: saved coordinates, otherwise the city center. */
export function resolvePropertyCoordinates(property: {
  latitude?: number | null
  longitude?: number | null
  bazaraki_district_id?: number | null
  city?: string | null
  area?: string | null
  district?: string | null
  address?: string | null
  location?: string | null
}): ResolvedMapCoordinates | null {
  if (isValidCoord(property.latitude, property.longitude)) {
    return {
      latitude: Number(property.latitude),
      longitude: Number(property.longitude),
      source: 'pin',
    }
  }

  const city = norm(property.city)
  const cityKey =
    city ||
    norm(property.district) ||
    norm(property.location).split(',')[0] ||
    norm(property.location).split('—')[0]
  if (cityKey && CITY_CENTERS[cityKey]) {
    return {...CITY_CENTERS[cityKey], source: 'city'}
  }

  for (const [key, coords] of Object.entries(CITY_CENTERS)) {
    if (cityKey.includes(key) || norm(property.location).includes(key)) {
      return {...coords, source: 'city'}
    }
  }

  return null
}

/** Fill missing lat/lng before writing to Supabase. District data loads only here. */
export async function withResolvedCoordinates<T extends {
  latitude?: number | null
  longitude?: number | null
  bazaraki_district_id?: number | null
  city?: string | null
  area?: string | null
  district?: string | null
  address?: string | null
}>(payload: T): Promise<T> {
  if (isValidCoord(payload.latitude, payload.longitude)) return payload

  const {resolveDistrictCoordinates} = await import('./mapCoordsDistricts')
  const fromDistrict = resolveDistrictCoordinates(payload)
  if (fromDistrict) {
    return {
      ...payload,
      latitude: fromDistrict.latitude,
      longitude: fromDistrict.longitude,
    }
  }

  const resolved = resolvePropertyCoordinates(payload)
  if (!resolved) return payload
  return {
    ...payload,
    latitude: resolved.latitude,
    longitude: resolved.longitude,
  }
}
