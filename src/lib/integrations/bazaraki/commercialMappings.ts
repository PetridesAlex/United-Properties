import type {Property} from '../../../types/cms'
import {
  deriveMustHaves,
  formatPostalCode,
  mapConstructionYear,
  mapEnergyEfficiencyToBazaraki,
  mapOnlineViewing,
  MUST_HAVES_WITH_PARKING,
  resolveArea,
} from './sharedMappings'

export type CommercialAttrs = {
  schema: 'commercial'
  area: number
  constructionYear: number | null
  energyEfficiency: number
  mustHaves: string | null
  onlineViewing: 10 | 20
  plotArea: number | null
  postalcode: string
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
}

export const COMMERCIAL_TYPE_LABELS: Record<number, string> = {
  1: 'Offices',
  2: 'Storage, warehouses',
  3: 'Restaurants, bars',
  4: 'Shops, showrooms',
  5: 'Other',
  6: 'Building',
  7: 'Mixed use',
  8: 'Residential buildings',
}

export function mapCommercialType(value: number | null | undefined): CommercialAttrs['type'] | null {
  if (value != null && value >= 1 && value <= 8) return value as CommercialAttrs['type']
  return null
}

export function buildCommercialAttrs(property: Property): CommercialAttrs | null {
  const postalcode = formatPostalCode(property.postal_code)
  const area = resolveArea(property.internal_area, property.covered_area)
  const energyEfficiency = mapEnergyEfficiencyToBazaraki(property.energy_efficiency)
  const type = mapCommercialType(property.bazaraki_commercial_type)

  if (!postalcode || area == null || energyEfficiency == null || type == null) return null

  const plotArea =
    property.plot_size != null && property.plot_size > 0 ? Math.round(property.plot_size) : null

  return {
    schema: 'commercial',
    area,
    constructionYear: mapConstructionYear(property.year_built),
    energyEfficiency,
    mustHaves: deriveMustHaves(
      property.features,
      property.bazaraki_must_haves,
      MUST_HAVES_WITH_PARKING,
    ),
    onlineViewing: mapOnlineViewing(property.bazaraki_online_viewing),
    plotArea,
    postalcode,
    type,
  }
}
