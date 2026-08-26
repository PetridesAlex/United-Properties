import type {Property, PropertyImage, SiteSettings} from '../../../types/cms'
import {buildApartmentAttrs, type ApartmentAttrs} from './apartmentMappings'
import {buildCommercialAttrs, type CommercialAttrs} from './commercialMappings'
import {
  escapeBazarakiDescription,
  extractWhatsappNumber,
  formatBazarakiPrice,
  formatBazarakiTitle,
  formatLastUpdate,
} from './formatters'
import {buildHousesAttrs, type HousesAttrs} from './housesMappings'
import {buildPlotsOfLandAttrs, type PlotsOfLandAttrs} from './landMappings'
import {BAZARAKI_MAX_IMAGES, resolveBazarakiRubric} from './mappings'
import {buildOtherAttrs, type OtherAttrs} from './otherMappings'
import {buildPrefabricatedHousesAttrs, type PrefabricatedHousesAttrs} from './prefabricatedHousesMappings'
import {buildResidentialBuildingsAttrs, type ResidentialBuildingsAttrs} from './residentialBuildingsMappings'
import {resolveAttrsSchema, type BazarakiAttrsSchema} from './schemaResolver'

export type BazarakiAttrs =
  | HousesAttrs
  | ApartmentAttrs
  | ResidentialBuildingsAttrs
  | CommercialAttrs
  | PrefabricatedHousesAttrs
  | OtherAttrs
  | PlotsOfLandAttrs

export interface BazarakiListItem {
  lastUpdate: string
  externalId: string
  imageUrls: string[]
  status: 'active'
  rubric: number
  district: number
  description: string
  price: string
  phoneHide: 0 | 1
  negotiablePrice: 0 | 1
  exchange: 0 | 1
  attrsSchema: BazarakiAttrsSchema
  attrs: BazarakiAttrs
  latitude: number | null
  longitude: number | null
  title: string
  whatsapp: string
}

function sortImages(images: PropertyImage[]): PropertyImage[] {
  return [...images].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return a.position - b.position
  })
}

function buildAttrs(property: Property, schema: BazarakiAttrsSchema): BazarakiAttrs | null {
  switch (schema) {
    case 'houses':
      return buildHousesAttrs(property)
    case 'apartment':
      return buildApartmentAttrs(property)
    case 'residentialBuildings':
      return buildResidentialBuildingsAttrs(property)
    case 'commercial':
      return buildCommercialAttrs(property)
    case 'prefabricatedHouses':
      return buildPrefabricatedHousesAttrs(property)
    case 'other':
      return buildOtherAttrs(property)
    case 'plotsOfLand':
      return buildPlotsOfLandAttrs(property)
  }
}

export function mapPropertyToListItem(
  property: Property & {property_images?: PropertyImage[]},
  settings: SiteSettings,
): BazarakiListItem | null {
  const schema = resolveAttrsSchema(property.property_type, property.status)
  const rubric = resolveBazarakiRubric(property.property_type, property.status, settings)

  if (schema == null || rubric == null || property.bazaraki_district_id == null) {
    return null
  }

  const attrs = buildAttrs(property, schema)
  if (!attrs) return null

  const images = sortImages(property.property_images ?? [])
    .map((img) => img.image_url?.trim())
    .filter(Boolean)
    .slice(0, BAZARAKI_MAX_IMAGES) as string[]

  const description =
    property.description?.trim() || property.short_description?.trim() || ''

  return {
    lastUpdate: formatLastUpdate(property.updated_at),
    externalId: property.id,
    imageUrls: images,
    status: 'active',
    rubric,
    district: property.bazaraki_district_id,
    description: escapeBazarakiDescription(description),
    price: formatBazarakiPrice(property.price),
    phoneHide: settings.bazaraki_phone_hide ? 1 : 0,
    negotiablePrice: settings.bazaraki_negotiable_price ? 1 : 0,
    exchange: settings.bazaraki_exchange ? 1 : 0,
    attrsSchema: schema,
    attrs,
    latitude: property.latitude,
    longitude: property.longitude,
    title: formatBazarakiTitle(property.title),
    whatsapp: extractWhatsappNumber(settings.social_whatsapp),
  }
}
