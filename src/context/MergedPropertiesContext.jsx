import { useMemo } from 'react'
import { properties } from '../data/properties'
import { MergedPropertiesContext } from './mergedPropertiesContext'

export function MergedPropertiesProvider({ children }) {
  const value = useMemo(
    () => ({
      list: properties,
      loading: false,
      error: null,
    }),
    [],
  )

  return <MergedPropertiesContext.Provider value={value}>{children}</MergedPropertiesContext.Provider>
}
