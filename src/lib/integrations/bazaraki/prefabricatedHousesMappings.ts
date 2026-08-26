import type {Property} from '../../../types/cms'
import {formatPostalCode} from './sharedMappings'

export type PrefabricatedHousesAttrs = {
  schema: 'prefabricatedHouses'
  postalcode: string
}

export function buildPrefabricatedHousesAttrs(
  property: Property,
): PrefabricatedHousesAttrs | null {
  const postalcode = formatPostalCode(property.postal_code)
  if (!postalcode) return null
  return {schema: 'prefabricatedHouses', postalcode}
}
