import {useCallback, useEffect, useState} from 'react'
import {fetchSiteContentMap} from '../lib/content/api'
import {resolveContentValue} from '../lib/content/schema'

export function useSiteContent() {
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

  return {map, loading, get}
}
