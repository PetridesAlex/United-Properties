import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {fetchSiteContentMap} from '../lib/content/api'
import {resolveContentValue} from '../lib/content/schema'

const SiteContentContext = createContext(null)

/** One shared fetch for all Navbar / Footer / page CMS reads. */
export function SiteContentProvider({children}) {
  const [map, setMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const next = await fetchSiteContentMap()
      if (!cancelled) {
        setMap(next)
        setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const get = useCallback(
    (page, section, key, fallback) => resolveContentValue(map, page, section, key, fallback),
    [map],
  )

  const value = useMemo(() => ({map, loading, get}), [map, loading, get])

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext)
  if (!ctx) {
    throw new Error('useSiteContent must be used inside SiteContentProvider')
  }
  return ctx
}
