import type {Property} from '../../../types/cms'
import {
  deriveMustHaves,
  formatPostalCode,
  mapConditionToBazaraki,
  mapConstructionYear,
  mapEnergyEfficiencyToBazaraki,
  mapOnlineViewing,
  MUST_HAVES_WITH_PARKING,
  resolveArea,
} from './sharedMappings'

export type ResidentialBuildingsAttrs = {
  schema: 'residentialBuildings'
  condition: number | null
  constructionYear: number | null
  energyEfficiency: number
  floorArea: number
  mustHaves: string | null
  onlineViewing: 10 | 20
  plotArea: number | null
  postalcode: string
  registrationBlock: number | null
  registrationNumber: number | null
}

export function buildResidentialBuildingsAttrs(
  property: Property,
): ResidentialBuildingsAttrs | null {
  const postalcode = formatPostalCode(property.postal_code)
  const floorArea = resolveArea(property.internal_area, property.covered_area)
  const energyEfficiency = mapEnergyEfficiencyToBazaraki(property.energy_efficiency)

  if (!postalcode || floorArea == null || energyEfficiency == null) return null

  const plotArea =
    property.plot_size != null && property.plot_size > 0 ? Math.round(property.plot_size) : null

  return {
    schema: 'residentialBuildings',
    condition: mapConditionToBazaraki(property.condition),
    constructionYear: mapConstructionYear(property.year_built),
    energyEfficiency,
    floorArea,
    mustHaves: deriveMustHaves(
      property.features,
      property.bazaraki_must_haves,
      MUST_HAVES_WITH_PARKING,
    ),
    onlineViewing: mapOnlineViewing(property.bazaraki_online_viewing),
    plotArea,
    postalcode,
    registrationBlock: property.registration_block ?? null,
    registrationNumber: property.registration_number ?? null,
  }
}
