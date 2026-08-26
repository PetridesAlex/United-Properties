import {useEffect, useMemo, useState} from 'react'
import {properties as staticProperties} from '../data/properties'
import {MergedPropertiesContext} from './mergedPropertiesContext'
import {isSupabaseConfigured} from '../lib/supabase/client'
import {fetchPublishedProperties} from '../lib/properties/api'
import {mapPropertyToPublicCard} from '../lib/properties/mappers'

export function MergedPropertiesProvider({children}) {
  const [list, setList] = useState(staticProperties)
  const [loading, setLoading] = useState(Boolean(isSupabaseConfigured))
  const [error, setError] = useState(null)
  const [source, setSource] = useState('static')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      try {
        const rows = await fetchPublishedProperties()
        if (cancelled) return
        if (rows.length > 0) {
          setList(rows.map(mapPropertyToPublicCard))
          setSource('supabase')
          setError(null)
        } else {
          // Keep static fallback until CMS is seeded
          setList(staticProperties)
          setSource('static')
        }
      } catch (err) {
        if (cancelled) return
        console.warn('[MergedProperties] Supabase load failed, using static data', err)
        setError(err instanceof Error ? err.message : 'Failed to load properties')
        setList(staticProperties)
        setSource('static')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      list,
      loading,
      error,
      source,
    }),
    [list, loading, error, source],
  )

  return (
    <MergedPropertiesContext.Provider value={value}>{children}</MergedPropertiesContext.Provider>
  )
}
