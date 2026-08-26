import type {Property} from '../../../types/cms'
import {
  formatPostalCode,
  mapConditionToBazaraki,
  resolveArea,
} from './sharedMappings'

export type OtherAttrs = {
  schema: 'other'
  area: number | null
  condition: number
  postalcode: string
}

export function buildOtherAttrs(property: Property): OtherAttrs | null {
  const postalcode = formatPostalCode(property.postal_code)
  const condition = mapConditionToBazaraki(property.condition)
  const area = resolveArea(property.internal_area, property.covered_area)

  if (!postalcode || condition == null) return null

  return {
    schema: 'other',
    area,
    condition,
    postalcode,
  }
}
