import type {PropertyStatus} from '../../../types/cms'

export type BazarakiAttrsSchema =
  | 'houses'
  | 'apartment'
  | 'residentialBuildings'
  | 'commercial'
  | 'prefabricatedHouses'
  | 'other'
  | 'plotsOfLand'

export const HOUSE_PROPERTY_TYPES = [
  'Villa',
  'Townhouse',
  'Holiday Home',
  'Detached House',
  'Semi-detached House',
  'Maisonette',
] as const

export const PREFAB_PROPERTY_TYPES = ['Prefabricated House', 'Development Unit'] as const

export const APARTMENT_PROPERTY_TYPES = ['Apartment', 'Penthouse'] as const

export const UNMAPPED_BAZARAKI_TYPES = [] as const

export function resolveAttrsSchema(
  propertyType: string | null | undefined,
  status: PropertyStatus,
): BazarakiAttrsSchema | null {
  const type = propertyType?.trim()
  if (!type) return null

  if (type === 'Commercial') return 'commercial'
  if ((APARTMENT_PROPERTY_TYPES as readonly string[]).includes(type)) return 'apartment'
  if (type === 'Residential Building') return 'residentialBuildings'
  if (type === 'Other') return 'other'
  if ((PREFAB_PROPERTY_TYPES as readonly string[]).includes(type)) {
    return status === 'for_sale' ? 'prefabricatedHouses' : null
  }
  if ((HOUSE_PROPERTY_TYPES as readonly string[]).includes(type)) return 'houses'
  if (type === 'Land') return 'plotsOfLand'
  return null
}

export function getAttrsSchemaLabel(schema: BazarakiAttrsSchema): string {
  switch (schema) {
    case 'houses':
      return 'Houses'
    case 'apartment':
      return 'Apartments, flats'
    case 'residentialBuildings':
      return 'Residential buildings'
    case 'commercial':
      return 'Commercial property'
    case 'prefabricatedHouses':
      return 'Prefabricated houses'
    case 'other':
      return 'Other'
    case 'plotsOfLand':
      return 'Plots of land'
  }
}

export function isBazarakiMappableType(
  propertyType: string | null | undefined,
  status: PropertyStatus,
): boolean {
  return resolveAttrsSchema(propertyType, status) != null
}
