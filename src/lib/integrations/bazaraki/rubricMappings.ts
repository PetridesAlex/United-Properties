import type {PropertyStatus, SiteSettings} from '../../../types/cms'

export type BazarakiRubricCategory =
  | 'apartments'
  | 'houses'
  | 'residentialBuildings'
  | 'prefabricatedHouses'
  | 'other'
  | 'commercial'
  | 'plotsOfLand'

export const DEFAULT_BAZARAKI_RUBRICS = {
  apartments_sale: 3528,
  apartments_rent: 3529,
  houses_sale: 678,
  houses_rent: 681,
  residential_buildings_sale: 2790,
  prefabricated_houses_sale: 3303,
  other_sale: 142,
  other_rent: 3531,
  commercial_sale: 2405,
  commercial_rent: 2408,
  plots_sale: 141,
  plots_rent: 3530,
  rooms_flatmates_rent: 2191,
  short_term_rent: 434,
} as const

/** Bazaraki → Real Estate for sale */
export const BAZARAKI_PROPERTY_TYPES_SALE = [
  'Houses',
  'Apartments, flats',
  'Commercial property',
  'Plots of land',
  'Residential buildings',
  'Prefabricated houses',
  'Other',
] as const

/** Bazaraki → Real Estate to rent */
export const BAZARAKI_PROPERTY_TYPES_RENT = [
  'Houses',
  'Apartments, flats',
  'Commercial property',
  'Plots of land',
  'Rooms, flatmates',
  'Short term',
  'Other',
] as const

/** @deprecated Use getBazarakiPropertyTypes(status) */
export const BAZARAKI_PROPERTY_TYPES = BAZARAKI_PROPERTY_TYPES_SALE

export type BazarakiPropertyTypeSale = (typeof BAZARAKI_PROPERTY_TYPES_SALE)[number]
export type BazarakiPropertyTypeRent = (typeof BAZARAKI_PROPERTY_TYPES_RENT)[number]
export type BazarakiPropertyType = BazarakiPropertyTypeSale | BazarakiPropertyTypeRent

type RubricRow = {
  category: BazarakiRubricCategory
  forSale: number | null
  forRent: number | null
  /** When set, used instead of category-based rent rubric lookup */
  rentRubricId?: number
}

const RUBRIC_CATEGORY_BY_TYPE: Record<string, RubricRow> = {
  Houses: {category: 'houses', forSale: 678, forRent: 681},
  'Apartments, flats': {category: 'apartments', forSale: 3528, forRent: 3529},
  'Commercial property': {category: 'commercial', forSale: 2405, forRent: 2408},
  'Plots of land': {category: 'plotsOfLand', forSale: 141, forRent: 3530},
  'Residential buildings': {category: 'residentialBuildings', forSale: 2790, forRent: null},
  'Prefabricated houses': {category: 'prefabricatedHouses', forSale: 3303, forRent: null},
  'Rooms, flatmates': {
    category: 'other',
    forSale: null,
    forRent: DEFAULT_BAZARAKI_RUBRICS.rooms_flatmates_rent,
    rentRubricId: DEFAULT_BAZARAKI_RUBRICS.rooms_flatmates_rent,
  },
  'Short term': {
    category: 'other',
    forSale: null,
    forRent: DEFAULT_BAZARAKI_RUBRICS.short_term_rent,
    rentRubricId: DEFAULT_BAZARAKI_RUBRICS.short_term_rent,
  },
  Other: {category: 'other', forSale: 142, forRent: 3531},
  // Legacy CMS types (existing listings)
  Apartment: {category: 'apartments', forSale: 3528, forRent: 3529},
  Penthouse: {category: 'apartments', forSale: 3528, forRent: 3529},
  Villa: {category: 'houses', forSale: 678, forRent: 681},
  Townhouse: {category: 'houses', forSale: 678, forRent: 681},
  'Holiday Home': {category: 'houses', forSale: 678, forRent: 681},
  'Detached House': {category: 'houses', forSale: 678, forRent: 681},
  'Semi-detached House': {category: 'houses', forSale: 678, forRent: 681},
  Maisonette: {category: 'houses', forSale: 678, forRent: 681},
  'Residential Building': {category: 'residentialBuildings', forSale: 2790, forRent: null},
  'Prefabricated House': {category: 'prefabricatedHouses', forSale: 3303, forRent: null},
  'Development Unit': {category: 'prefabricatedHouses', forSale: 3303, forRent: null},
  Commercial: {category: 'commercial', forSale: 2405, forRent: 2408},
  Land: {category: 'plotsOfLand', forSale: 141, forRent: 3530},
}

export function isRentListingStatus(status: PropertyStatus | null | undefined): boolean {
  return status === 'for_rent' || status === 'rented'
}

export function getBazarakiPropertyTypes(
  status: PropertyStatus | null | undefined,
): readonly string[] {
  return isRentListingStatus(status) ? BAZARAKI_PROPERTY_TYPES_RENT : BAZARAKI_PROPERTY_TYPES_SALE
}

export function isPropertyTypeValidForStatus(
  propertyType: string | null | undefined,
  status: PropertyStatus | null | undefined,
): boolean {
  const type = propertyType?.trim()
  if (!type) return false
  return getBazarakiPropertyTypes(status).includes(type)
}

export type BazarakiRubricSettings = Pick<
  SiteSettings,
  | 'bazaraki_rubric_apartments_sale'
  | 'bazaraki_rubric_apartments_rent'
  | 'bazaraki_rubric_houses_sale'
  | 'bazaraki_rubric_houses_rent'
  | 'bazaraki_rubric_residential_buildings_sale'
  | 'bazaraki_rubric_prefabricated_houses_sale'
  | 'bazaraki_rubric_other_sale'
  | 'bazaraki_rubric_other_rent'
  | 'bazaraki_rubric_commercial_sale'
  | 'bazaraki_rubric_commercial_rent'
  | 'bazaraki_rubric_plots_sale'
  | 'bazaraki_rubric_plots_rent'
>

export function getRubricCategoryLabel(category: BazarakiRubricCategory): string {
  switch (category) {
    case 'apartments':
      return 'Apartments, flats'
    case 'houses':
      return 'Houses'
    case 'residentialBuildings':
      return 'Residential buildings'
    case 'prefabricatedHouses':
      return 'Prefabricated houses'
    case 'other':
      return 'Other'
    case 'commercial':
      return 'Commercial property'
    case 'plotsOfLand':
      return 'Plots of land'
  }
}

export function resolveRubricCategory(
  propertyType: string | null | undefined,
): BazarakiRubricCategory | null {
  if (!propertyType?.trim()) return null
  return RUBRIC_CATEGORY_BY_TYPE[propertyType.trim()]?.category ?? null
}

function rubricFromSettings(
  category: BazarakiRubricCategory,
  status: 'for_sale' | 'for_rent',
  settings?: Partial<BazarakiRubricSettings>,
): number | null {
  const isSale = status === 'for_sale'
  switch (category) {
    case 'apartments':
      return (
        (isSale ? settings?.bazaraki_rubric_apartments_sale : settings?.bazaraki_rubric_apartments_rent) ??
        (isSale ? DEFAULT_BAZARAKI_RUBRICS.apartments_sale : DEFAULT_BAZARAKI_RUBRICS.apartments_rent)
      )
    case 'houses':
      return (
        (isSale ? settings?.bazaraki_rubric_houses_sale : settings?.bazaraki_rubric_houses_rent) ??
        (isSale ? DEFAULT_BAZARAKI_RUBRICS.houses_sale : DEFAULT_BAZARAKI_RUBRICS.houses_rent)
      )
    case 'residentialBuildings':
      return (
        settings?.bazaraki_rubric_residential_buildings_sale ??
        DEFAULT_BAZARAKI_RUBRICS.residential_buildings_sale
      )
    case 'prefabricatedHouses':
      return (
        settings?.bazaraki_rubric_prefabricated_houses_sale ??
        DEFAULT_BAZARAKI_RUBRICS.prefabricated_houses_sale
      )
    case 'other':
      return (
        (isSale ? settings?.bazaraki_rubric_other_sale : settings?.bazaraki_rubric_other_rent) ??
        (isSale ? DEFAULT_BAZARAKI_RUBRICS.other_sale : DEFAULT_BAZARAKI_RUBRICS.other_rent)
      )
    case 'commercial':
      return (
        (isSale ? settings?.bazaraki_rubric_commercial_sale : settings?.bazaraki_rubric_commercial_rent) ??
        (isSale ? DEFAULT_BAZARAKI_RUBRICS.commercial_sale : DEFAULT_BAZARAKI_RUBRICS.commercial_rent)
      )
    case 'plotsOfLand':
      return (
        (isSale ? settings?.bazaraki_rubric_plots_sale : settings?.bazaraki_rubric_plots_rent) ??
        (isSale ? DEFAULT_BAZARAKI_RUBRICS.plots_sale : DEFAULT_BAZARAKI_RUBRICS.plots_rent)
      )
  }
}

export function resolveBazarakiRubric(
  propertyType: string | null | undefined,
  status: PropertyStatus,
  settings?: Partial<BazarakiRubricSettings>,
): number | null {
  if (status !== 'for_sale' && status !== 'for_rent') return null
  const row = propertyType?.trim() ? RUBRIC_CATEGORY_BY_TYPE[propertyType.trim()] : undefined
  if (!row) return null
  if (status === 'for_sale') {
    if (row.forSale == null) return null
    return rubricFromSettings(row.category, 'for_sale', settings)
  }
  if (row.forRent == null) return null
  return row.rentRubricId ?? rubricFromSettings(row.category, 'for_rent', settings)
}
