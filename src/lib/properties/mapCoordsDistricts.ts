import {
  getAllBazarakiDistricts,
  getDistrictCoordinates,
} from '../integrations/bazaraki/districts'
import type {ResolvedMapCoordinates} from './mapCoords'

type DistrictProperty = {
  latitude?: number | null
  longitude?: number | null
  bazaraki_district_id?: number | null
  city?: string | null
  area?: string | null
}

function isValidCoord(lat: unknown, lng: unknown) {
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

/** District-level pin. Loaded only when saving a listing, not on the public pages. */
export function resolveDistrictCoordinates(
  property: DistrictProperty,
): ResolvedMapCoordinates | null {
  const fromDistrictId = getDistrictCoordinates(property.bazaraki_district_id)
  if (fromDistrictId) {
    return {...fromDistrictId, source: 'district'}
  }

  const area = norm(property.area)
  const city = norm(property.city)
  if (!area && !city) return null

  const areaMatch = getAllBazarakiDistricts().find((district) => {
    if (!isValidCoord(district.latitude, district.longitude)) return false
    const areaOk = area
      ? district.areaName.toLowerCase() === area || district.name.toLowerCase().includes(area)
      : true
    const cityOk = city ? district.cityName.toLowerCase() === city : true
    return areaOk && cityOk
  })

  if (areaMatch?.latitude == null || areaMatch.longitude == null) return null
  return {
    latitude: areaMatch.latitude,
    longitude: areaMatch.longitude,
    source: 'area',
  }
}
