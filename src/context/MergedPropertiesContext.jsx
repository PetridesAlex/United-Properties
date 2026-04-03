import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { properties } from '../data/properties'
import { sanityClient } from '../lib/sanityClient'
import { mapSanityProperty, mergeSanityAndStaticProperties } from '../lib/mapSanityProperty'
import { fetchSanityQueryOverHttp } from '../lib/sanityPublicFetch'
import { ALL_PROPERTIES_QUERY } from '../lib/sanityQueries'
import { MergedPropertiesContext } from './mergedPropertiesContext'

const initialMerged = () => mergeSanityAndStaticProperties(properties, [])

const REFETCH_AFTER_MS = 45_000

async function fetchAllPropertiesRaw() {
  try {
    return await sanityClient.fetch(ALL_PROPERTIES_QUERY, {}, {})
  } catch (clientErr) {
    if (import.meta.env.DEV) {
      console.warn('[United Properties] sanity client fetch failed, using HTTP API', clientErr)
    }
    return fetchSanityQueryOverHttp(ALL_PROPERTIES_QUERY)
  }
}

export function MergedPropertiesProvider({ children }) {
  const [list, setList] = useState(initialMerged)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)
  const lastFetchAtRef = useRef(0)

  const load = useCallback(async (showLoading) => {
    const id = ++requestIdRef.current
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const result = await fetchAllPropertiesRaw()
      if (id !== requestIdRef.current) return

      if (Array.isArray(result)) {
        const mapped = result
          .map((doc, index) => {
            try {
              return mapSanityProperty(doc, index)
            } catch (err) {
              if (import.meta.env.DEV) {
                console.error('[MergedProperties] Skipped document', doc?._id, err)
              }
              return null
            }
          })
          .filter(Boolean)
        setList(mergeSanityAndStaticProperties(properties, mapped))
        lastFetchAtRef.current = Date.now()
      } else {
        setList(initialMerged())
      }
    } catch (err) {
      if (id !== requestIdRef.current) return
      setError(err?.message || 'Could not load properties')
      setList(initialMerged())
      if (import.meta.env.DEV) {
        console.error('[MergedProperties]', err)
      }
    } finally {
      if (id === requestIdRef.current && showLoading) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    load(true)
  }, [load])

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastFetchAtRef.current < REFETCH_AFTER_MS) return
      load(false)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [load])

  const value = useMemo(() => ({ list, loading, error }), [list, loading, error])
  return <MergedPropertiesContext.Provider value={value}>{children}</MergedPropertiesContext.Provider>
}
