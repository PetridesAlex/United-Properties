import type {Property} from '../../../types/cms'
import {formatPostalCode, mapOnlineViewing} from './sharedMappings'

export const LAND_TYPE_OPTIONS = ['Field', 'Plot'] as const
export const PLOT_TYPE_OPTIONS = [
  'Residential',
  'Agricultural',
  'Commercial',
  'Industrial',
  'Tourist',
] as const
export const SHARE_OPTIONS = ['Yes', 'No'] as const

const LAND_TYPE_TO_BAZARAKI: Record<string, 10 | 20> = {
  Field: 10,
  Plot: 20,
}

const PLOT_TYPE_TO_BAZARAKI: Record<string, 10 | 20 | 30 | 40 | 50> = {
  Residential: 10,
  Agricultural: 20,
  Commercial: 30,
  Industrial: 40,
  Tourist: 50,
}

const SHARE_TO_BAZARAKI: Record<string, 10 | 20> = {
  Yes: 10,
  No: 20,
}

export function mapLandTypeToBazaraki(value: string | null | undefined): 10 | 20 | null {
  if (!value?.trim()) return null
  return LAND_TYPE_TO_BAZARAKI[value.trim()] ?? null
}

export function mapPlotTypeToBazaraki(
  value: string | null | undefined,
): 10 | 20 | 30 | 40 | 50 | null {
  if (!value?.trim()) return null
  return PLOT_TYPE_TO_BAZARAKI[value.trim()] ?? null
}

export function mapShareToBazaraki(value: string | null | undefined): 10 | 20 | null {
  if (!value?.trim()) return null
  return SHARE_TO_BAZARAKI[value.trim()] ?? null
}

export type PlotsOfLandAttrs = {
  schema: 'plotsOfLand'
  coverage: string | null
  density: string | null
  landType: 10 | 20
  onlineViewing: 10 | 20
  parcelNumber: string | null
  planningZone: string | null
  plotArea: number
  plotType: 10 | 20 | 30 | 40 | 50
  postalcode: string
  registrationBlock: number | null
  registrationNumber: number | null
  share: 10 | 20 | null
}

export function buildPlotsOfLandAttrs(property: Property): PlotsOfLandAttrs | null {
  const postalcode = formatPostalCode(property.postal_code)
  const landType = mapLandTypeToBazaraki(property.land_type)
  const plotType = mapPlotTypeToBazaraki(property.plot_type)
  const plotArea =
    property.plot_size != null && property.plot_size > 0 ? Math.round(property.plot_size) : null

  if (!postalcode || landType == null || plotType == null || plotArea == null) return null

  const share = mapShareToBazaraki(property.share)

  return {
    schema: 'plotsOfLand',
    coverage: property.coverage?.trim() || null,
    density: property.building_density?.trim() || null,
    landType,
    onlineViewing: mapOnlineViewing(property.bazaraki_online_viewing),
    parcelNumber: property.parcel_number?.trim() || null,
    planningZone: property.planning_zone?.trim() || null,
    plotArea,
    plotType,
    postalcode,
    registrationBlock: property.registration_block ?? null,
    registrationNumber: property.registration_number ?? null,
    share,
  }
}
