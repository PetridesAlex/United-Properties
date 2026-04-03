import { useContext } from 'react'
import { MergedPropertiesContext } from '../context/mergedPropertiesContext'
import { MergedPropertiesProvider } from '../context/MergedPropertiesContext.jsx'

export function useMergedProperties() {
  const ctx = useContext(MergedPropertiesContext)
  if (!ctx) {
    throw new Error('useMergedProperties must be used inside MergedPropertiesProvider')
  }
  return ctx
}

export { MergedPropertiesProvider }
