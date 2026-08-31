import type {Property} from '../../../types/cms'
import {
  deriveMustHaves,
  formatPostalCode,
  inferAirConditioningFromFeatures,
  inferParkingFromProperty,
  mapAirConditioningLevel,
  mapBathrooms,
  mapBedroomsHouses,
  mapConstructionYear,
  mapEnergyEfficiencyToBazaraki,
  mapFurnishingToBazaraki,
  mapOnlineViewing,
  mapParkingLevel,
  mapPetsLevel,
  MUST_HAVES_WITHOUT_PARKING,
  resolveArea,
} from './sharedMappings'

export type HousesAttrs = {
  schema: 'houses'
  airConditioning: 1 | 2 | 3
  area: number
  constructionYear: number | null
  energyEfficiency: number
  furnishing: number | null
  mustHaves: string | null
  bathrooms: number | null
  bedrooms: number
  onlineViewing: 10 | 20
  parking: 1 | 2 | 3
  pets: 1 | 2
  plotArea: number | null
  postalcode: string
  type: 1 | 2 | 7 | 9
}

export const BAZARAKI_HOUSE_TYPE_LABELS: Record<number, string> = {
  1: 'Detached house',
  2: 'Semi-detached',
  7: 'Maisonette',
  9: 'Villa',
}

const PROPERTY_TYPE_TO_HOUSE_TYPE: Record<string, 1 | 2 | 7 | 9> = {
  'Detached House': 1,
  'Semi-detached House': 2,
  Maisonette: 7,
  Townhouse: 7,
  Villa: 9,
}

export function mapHouseType(
  propertyType: string | null | undefined,
  override: number | null | undefined,
): 1 | 2 | 7 | 9 | null {
  if (override === 1 || override === 2 || override === 7 || override === 9) return override
  const type = propertyType?.trim()
  if (!type) return null
  if (type === 'Houses') return null
  return PROPERTY_TYPE_TO_HOUSE_TYPE[type] ?? (type === 'Holiday Home' ? 1 : null)
}

export function buildHousesAttrs(property: Property): HousesAttrs | null {
  const postalcode = formatPostalCode(property.postal_code)
  const area = resolveArea(property.internal_area, property.covered_area)
  const energyEfficiency = mapEnergyEfficiencyToBazaraki(property.energy_efficiency)
  const bedrooms = mapBedroomsHouses(property.bedrooms)
  const type = mapHouseType(property.property_type, property.bazaraki_house_type)

  if (!postalcode || area == null || energyEfficiency == null || bedrooms == null || type == null) {
    return null
  }

  const airConditioning =
    mapAirConditioningLevel(property.bazaraki_air_conditioning) ??
    inferAirConditioningFromFeatures(property.features)

  const parking =
    mapParkingLevel(property.bazaraki_parking) ??
    inferParkingFromProperty(property.parking_spaces, property.features)

  const pets = mapPetsLevel(property.bazaraki_pets) ?? 2

  const plotArea =
    property.plot_size != null && property.plot_size > 0 ? Math.round(property.plot_size) : null

  return {
    schema: 'houses',
    airConditioning,
    area,
    constructionYear: mapConstructionYear(property.year_built),
    energyEfficiency,
    furnishing: mapFurnishingToBazaraki(property.furnishing),
    mustHaves: deriveMustHaves(
      property.features,
      property.bazaraki_must_haves,
      MUST_HAVES_WITHOUT_PARKING,
    ),
    bathrooms: mapBathrooms(property.bathrooms),
    bedrooms,
    onlineViewing: mapOnlineViewing(property.bazaraki_online_viewing),
    parking,
    pets,
    plotArea,
    postalcode,
    type,
  }
}
