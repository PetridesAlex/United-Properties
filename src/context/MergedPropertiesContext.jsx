import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { properties } from '../data/properties'
import { sanityClient } from '../lib/sanityClient'
import { logSanityFetchError } from '../lib/logSanityFetchError'
import { mapSanityProperty, mergeSanityAndStaticProperties } from '../lib/mapSanityProperty'
import { fetchSanityQueryOverHttp } from '../lib/sanityPublicFetch'
import { getActivePropertiesQuery, getActiveQueryLabel } from '../lib/sanityQueries'
import { MergedPropertiesContext } from './mergedPropertiesContext'

const initialMerged = () => mergeSanityAndStaticProperties(properties, [])

const REFETCH_AFTER_MS = 45_000

async function fetchAllPropertiesRaw() {
  const query = getActivePropertiesQuery()
  const label = getActiveQueryLabel()
  try {
    const rows = await sanityClient.fetch(query, {}, {})
    console.debug('[United Properties] Sanity loaded via @sanity/client', {
      query: label,
      count: Array.isArray(rows) ? rows.length : null,
    })
    return rows
  } catch (clientErr) {
    logSanityFetchError('@sanity/client.fetch', clientErr, { queryLabel: label, fallback: 'HTTP GET' })
    console.warn('[United Properties] Retrying Sanity query over HTTP GET…')
    return fetchSanityQueryOverHttp(query)
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
              console.error('[MergedProperties] Skipped document', doc?._id, err)
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
      logSanityFetchError('merged load (client + HTTP failed)', err, {
        queryLabel: getActiveQueryLabel(),
      })
      setError(err?.message || 'Could not load properties')
      setList(initialMerged())
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
