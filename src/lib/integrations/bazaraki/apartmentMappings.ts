import type {Property} from '../../../types/cms'
import {
  deriveMustHaves,
  formatPostalCode,
  inferAirConditioningFromFeatures,
  inferParkingFromProperty,
  mapAirConditioningLevel,
  mapBathrooms,
  mapBedroomsApartment,
  mapConditionToBazaraki,
  mapConstructionYear,
  mapEnergyEfficiencyToBazaraki,
  mapFloorToBazaraki,
  mapFurnishingToBazaraki,
  mapOnlineViewing,
  mapParkingLevel,
  mapPetsLevel,
  MUST_HAVES_WITHOUT_PARKING,
  resolveArea,
} from './sharedMappings'

export type ApartmentAttrs = {
  schema: 'apartment'
  airConditioning: 1 | 2 | 3
  area: number
  condition: number
  constructionYear: number | null
  energyEfficiency: number
  floor: number | null
  furnishing: number | null
  mustHaves: string | null
  bathrooms: number | null
  bedrooms: number
  onlineViewing: 10 | 20
  parking: 1 | 2 | 3
  pets: 1 | 2
  postalcode: string
  type: 5 | 8
}

export function mapApartmentType(propertyType: string | null | undefined): 5 | 8 | null {
  if (propertyType === 'Apartment' || propertyType === 'Apartments, flats') return 5
  if (propertyType === 'Penthouse') return 8
  return null
}

export function buildApartmentAttrs(property: Property): ApartmentAttrs | null {
  const postalcode = formatPostalCode(property.postal_code)
  const area = resolveArea(property.internal_area, property.covered_area)
  const energyEfficiency = mapEnergyEfficiencyToBazaraki(property.energy_efficiency)
  const bedrooms = mapBedroomsApartment(property.bedrooms)
  const type = mapApartmentType(property.property_type)
  const condition = mapConditionToBazaraki(property.condition)

  if (
    !postalcode ||
    area == null ||
    energyEfficiency == null ||
    bedrooms == null ||
    type == null ||
    condition == null
  ) {
    return null
  }

  const airConditioning =
    mapAirConditioningLevel(property.bazaraki_air_conditioning) ??
    inferAirConditioningFromFeatures(property.features)

  const parking =
    mapParkingLevel(property.bazaraki_parking) ??
    inferParkingFromProperty(property.parking_spaces, property.features)

  return {
    schema: 'apartment',
    airConditioning,
    area,
    condition,
    constructionYear: mapConstructionYear(property.year_built),
    energyEfficiency,
    floor: mapFloorToBazaraki(property.floor),
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
    pets: mapPetsLevel(property.bazaraki_pets) ?? 2,
    postalcode,
    type,
  }
}
