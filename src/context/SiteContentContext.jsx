import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {fetchSiteContentMap} from '../lib/content/api'
import {
  CONTENT_PAGES,
  contentKey,
  getContentPageByPath,
  resolveContentValue,
} from '../lib/content/schema'
import {isCmsPreviewMode} from '../lib/content/cmsPreview'

const SiteContentContext = createContext(null)

const SITEWIDE_PAGE_IDS = ['navbar', 'footer', 'cookies', 'inquiry', 'search', 'not-found']

/**
 * One shared fetch for all Navbar / Footer / page CMS reads.
 * In CMS preview (admin iframe), every get() is also recorded so the inline
 * editor can match DOM text → content keys. Schema fields for the current
 * page + sitewide chrome are pre-seeded so every header/section is editable.
 */
export function SiteContentProvider({children}) {
  const [map, setMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [registryVersion, setRegistryVersion] = useState(0)
  const registryRef = useRef(new Map())
  const bumpTimer = useRef(null)
  const editMode = typeof window !== 'undefined' && isCmsPreviewMode()

  const load = useCallback(async () => {
    const next = await fetchSiteContentMap()
    setMap(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      const next = await fetchSiteContentMap()
      if (!cancelled) {
        setMap(next)
        setLoading(false)
      }
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  const scheduleBump = useCallback(() => {
    if (bumpTimer.current) return
    bumpTimer.current = window.setTimeout(() => {
      bumpTimer.current = null
      setRegistryVersion((v) => v + 1)
    }, 80)
  }, [])

  const record = useCallback(
    (page, section, key, value) => {
      if (!editMode) return
      const fullKey = contentKey(page, section, key)
      const text = String(value ?? '')
      if (!text.trim()) return

      const entry = {page, section, key, fullKey, value: text}
      const byValue = registryRef.current
      let changed = false

      let list = byValue.get(text)
      if (!list) {
        list = []
        byValue.set(text, list)
        changed = true
      }
      if (!list.some((e) => e.fullKey === fullKey)) {
        list.push(entry)
        changed = true
      }

      const keySlot = `__key__:${fullKey}`
      if (!byValue.has(keySlot)) {
        byValue.set(keySlot, [entry])
        changed = true
      } else {
        byValue.set(keySlot, [entry])
      }

      if (changed) scheduleBump()
    },
    [editMode, scheduleBump],
  )

  // Pre-seed every field for the current route page + sitewide chrome
  useEffect(() => {
    if (!editMode || loading) return
    const path = typeof window !== 'undefined' ? window.location.pathname : '/'
    const pathPage = getContentPageByPath(path)
    const pages = [
      ...(pathPage ? [pathPage] : []),
      ...CONTENT_PAGES.filter((p) => SITEWIDE_PAGE_IDS.includes(p.id)),
    ]
    const seen = new Set()
    for (const page of pages) {
      if (seen.has(page.id)) continue
      seen.add(page.id)
      for (const section of page.sections) {
        for (const field of section.fields) {
          const value = resolveContentValue(map, page.id, section.id, field.key, field.defaultValue)
          record(page.id, section.id, field.key, value)
        }
      }
    }
  }, [editMode, loading, map, record])

  const get = useCallback(
    (page, section, key, fallback) => {
      const value = resolveContentValue(map, page, section, key, fallback)
      record(page, section, key, value)
      return value
    },
    [map, record],
  )

  const setValue = useCallback(
    (page, section, key, value) => {
      const fullKey = contentKey(page, section, key)
      setMap((prev) => ({...prev, [fullKey]: value}))
      const entry = {page, section, key, fullKey, value: String(value ?? '')}
      registryRef.current.set(`__key__:${fullKey}`, [entry])
      if (entry.value.trim()) {
        let list = registryRef.current.get(entry.value)
        if (!list) {
          list = []
          registryRef.current.set(entry.value, list)
        }
        if (!list.some((e) => e.fullKey === fullKey)) list.push(entry)
      }
      scheduleBump()
    },
    [scheduleBump],
  )

  const reload = useCallback(async () => {
    setLoading(true)
    registryRef.current = new Map()
    await load()
  }, [load])

  const getRegistryEntries = useCallback(() => {
    const entries = []
    const seen = new Set()
    for (const [k, list] of registryRef.current.entries()) {
      if (String(k).startsWith('__key__:')) continue
      for (const entry of list) {
        if (seen.has(entry.fullKey)) continue
        seen.add(entry.fullKey)
        entries.push(entry)
      }
    }
    return entries
  }, [registryVersion])

  const lookupByText = useCallback(
    (text) => {
      const normalized = String(text ?? '').trim()
      if (!normalized) return []
      return registryRef.current.get(normalized) ?? registryRef.current.get(String(text ?? '')) ?? []
    },
    [registryVersion],
  )

  const value = useMemo(
    () => ({
      map,
      loading,
      get,
      setValue,
      reload,
      editMode,
      registryVersion,
      getRegistryEntries,
      lookupByText,
    }),
    [map, loading, get, setValue, reload, editMode, registryVersion, getRegistryEntries, lookupByText],
  )

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext)
  if (!ctx) {
    throw new Error('useSiteContent must be used inside SiteContentProvider')
  }
  return ctx
}
