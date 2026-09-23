import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {List, Pencil, RotateCcw, Search, X} from 'lucide-react'
import toast from 'react-hot-toast'
import {useSiteContent} from '../../hooks/useSiteContent'
import {saveContentValue} from '../../lib/content/api'
import {findFieldDef, CONTENT_PAGES, parseContentKey} from '../../lib/content/schema'
import {supabase} from '../../lib/supabase/client'
import {
  CMS_EDIT_MODE_MESSAGE,
  isCmsBridgeMessage,
  isCmsEditMode,
  isCmsPreviewMode,
  postCmsReady,
  postCmsSaved,
  setCmsEditToolsPreference,
  withCmsPreviewSearch,
} from '../../lib/content/cmsPreview'
import './InlineEditor.css'

const ATTRS = ['placeholder', 'aria-label', 'title']
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'TEXTAREA', 'INPUT', 'SELECT'])

/**
 * Runs inside the public site when opened as the CMS preview iframe.
 * Matches rendered text to CMS keys and shows gold pencils for click-to-edit.
 */
export default function InlineEditor() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    get,
    setValue,
    registryVersion,
    getRegistryEntries,
    map,
  } = useSiteContent()

  const [inPreview, setInPreview] = useState(() => isCmsPreviewMode())
  const [pencilsOn, setPencilsOn] = useState(() => isCmsEditMode())
  const [hoverTarget, setHoverTarget] = useState(null)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerQuery, setDrawerQuery] = useState('')
  const [drawerEditKey, setDrawerEditKey] = useState(null)
  const [drawerDraft, setDrawerDraft] = useState('')
  const scanTimer = useRef(null)
  const markedRef = useRef(new WeakSet())

  useEffect(() => {
    setInPreview(isCmsPreviewMode())
    setPencilsOn(isCmsEditMode())
  }, [location.pathname, location.search])

  // Keep preview markers on the URL while browsing pages inside the iframe.
  useEffect(() => {
    if (!inPreview) return
    const next = withCmsPreviewSearch(location.pathname, location.search, {edit: pencilsOn})
    const current = `${location.pathname}${location.search || ''}`
    if (next !== current) {
      navigate(next, {replace: true})
    }
  }, [inPreview, pencilsOn, location.pathname, location.search, navigate])

  useEffect(() => {
    if (!inPreview) return undefined
    postCmsReady()
    let pulses = 0
    const readyPulse = window.setInterval(() => {
      postCmsReady()
      pulses += 1
      if (pulses >= 8) window.clearInterval(readyPulse)
    }, 700)
    return () => window.clearInterval(readyPulse)
  }, [inPreview, location.key])

  // Parent can toggle pencils on/off
  useEffect(() => {
    if (!inPreview) return undefined
    function onMessage(event) {
      if (!isCmsBridgeMessage(event.data, CMS_EDIT_MODE_MESSAGE)) return
      const enabled = Boolean(event.data.enabled)
      setCmsEditToolsPreference(enabled)
      setPencilsOn(enabled)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [inPreview])

  const scanDocument = useCallback(() => {
    if (!inPreview || !pencilsOn) return
    const entries = getRegistryEntries()

    const valueIndex = new Map()
    const byPageSection = new Map()
    for (const entry of entries) {
      const text = normalizeText(entry.value)
      if (text.length >= 2) {
        let list = valueIndex.get(text)
        if (!list) {
          list = []
          valueIndex.set(text, list)
        }
        if (!list.some((e) => e.fullKey === entry.fullKey)) list.push(entry)
      }
      const region = `${entry.page}::${entry.section}`
      let regionList = byPageSection.get(region)
      if (!regionList) {
        regionList = []
        byPageSection.set(region, regionList)
      }
      if (!regionList.some((e) => e.fullKey === entry.fullKey)) regionList.push(entry)
    }

    // 1) Explicit field markers (CmsText / SectionHeader / cmsFieldProps)
    document.querySelectorAll('[data-cms-page][data-cms-section][data-cms-field]').forEach((el) => {
      if (el.closest('.cms-inline-root, .cms-inline-popup, .cms-inline-drawer')) return
      const page = el.getAttribute('data-cms-page')
      const section = el.getAttribute('data-cms-section')
      const field = el.getAttribute('data-cms-field')
      if (!page || !section || !field) return
      const fullKey = `${page}.${section}.${field}`
      el.setAttribute('data-cms-editable', '1')
      el.setAttribute('data-cms-keys', fullKey)
      markedRef.current.add(el)
    })

    // 2) Inside each CMS region, match headings / labels to that section's fields
    document.querySelectorAll('[data-cms-page][data-cms-section]').forEach((region) => {
      if (region.closest('.cms-inline-root, .cms-inline-popup, .cms-inline-drawer')) return
      if (region.hasAttribute('data-cms-field')) return
      const page = region.getAttribute('data-cms-page')
      const section = region.getAttribute('data-cms-section')
      const regionEntries = byPageSection.get(`${page}::${section}`) || []
      if (!regionEntries.length) return

      const candidates = region.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, span, a, button, label, li, strong, em, figcaption',
      )
      candidates.forEach((el) => {
        if (el.closest('[data-cms-field]')) return
        if (el.closest('.cms-inline-root, .cms-inline-popup, .cms-inline-drawer')) return
        if (el.getAttribute('data-cms-editable') === '1') return
        const text = normalizeText(el.textContent)
        if (text.length < 2 || text.length > 280) return
        const matches = regionEntries.filter((e) => normalizeText(e.value) === text)
        if (!matches.length) return
        markElement(el, matches)
        markedRef.current.add(el)
      })
    })

    // 3) Global text-node fallback for anything not yet marked
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT
        if (parent.closest('.cms-inline-root, .cms-inline-popup, .cms-inline-drawer, .cms-inline-pencil')) {
          return NodeFilter.FILTER_REJECT
        }
        if (parent.getAttribute('data-cms-editable') === '1') return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_ACCEPT
      },
    })

    let node
    while ((node = walker.nextNode())) {
      const text = normalizeText(node.nodeValue)
      const matches = valueIndex.get(text)
      if (!matches?.length) continue
      const el = node.parentElement
      if (!el || markedRef.current.has(el)) continue
      // Prefer matches that belong to the nearest CMS region
      const region = el.closest('[data-cms-page][data-cms-section]')
      let preferred = matches
      if (region) {
        const page = region.getAttribute('data-cms-page')
        const section = region.getAttribute('data-cms-section')
        const scoped = matches.filter((m) => m.page === page && m.section === section)
        if (scoped.length) preferred = scoped
      }
      markElement(el, preferred)
      markedRef.current.add(el)
    }

    // Attribute matches (placeholders, aria-labels)
    document.querySelectorAll('[placeholder], [aria-label], [title]').forEach((el) => {
      if (el.closest('.cms-inline-root, .cms-inline-popup, .cms-inline-drawer')) return
      if (el.getAttribute('data-cms-editable') === '1') return
      for (const attr of ATTRS) {
        const val = el.getAttribute(attr)
        if (!val?.trim()) continue
        const matches = valueIndex.get(normalizeText(val))
        if (matches?.length) {
          markElement(el, matches, attr)
          markedRef.current.add(el)
          break
        }
      }
    })
  }, [inPreview, pencilsOn, getRegistryEntries, registryVersion])

  function markElement(el, matches, attr = null) {
    el.setAttribute('data-cms-editable', '1')
    el.setAttribute('data-cms-keys', matches.map((m) => m.fullKey).join('|'))
    if (attr) el.setAttribute('data-cms-attr', attr)
    if (matches.length === 1) {
      const m = matches[0]
      el.setAttribute('data-cms-page', m.page)
      el.setAttribute('data-cms-section', m.section)
      el.setAttribute('data-cms-field', m.key)
    }
  }

  function normalizeText(value) {
    return String(value ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  useEffect(() => {
    if (!inPreview || !pencilsOn) {
      document.documentElement.classList.remove('cms-inline-mode')
      return undefined
    }

    document.documentElement.classList.add('cms-inline-mode')

    const schedule = () => {
      window.clearTimeout(scanTimer.current)
      scanTimer.current = window.setTimeout(scanDocument, 120)
    }
    schedule()

    const observer = new MutationObserver(schedule)
    observer.observe(document.body, {childList: true, subtree: true, characterData: true})

    return () => {
      window.clearTimeout(scanTimer.current)
      observer.disconnect()
      document.documentElement.classList.remove('cms-inline-mode')
    }
  }, [inPreview, pencilsOn, scanDocument, location.key, registryVersion])

  const openEditor = useCallback(
    (el, propertyHint = null) => {
      if (propertyHint) {
        setEditing({
          kind: 'property',
          propertyId: propertyHint.id,
          propertySlug: propertyHint.slug,
          rect: el.getBoundingClientRect(),
        })
        return
      }

      const keysAttr = el.getAttribute('data-cms-keys') || ''
      let keyList = keysAttr.split('|').filter(Boolean)
      if (!keyList.length) {
        const page = el.getAttribute('data-cms-page')
        const section = el.getAttribute('data-cms-section')
        const field = el.getAttribute('data-cms-field')
        if (page && section && field) keyList = [`${page}.${section}.${field}`]
      }
      const matches = keyList
        .map((fullKey) => {
          const parsed = parseContentKey(fullKey)
          if (!parsed) return null
          const {page, section, key} = parsed
          const def = findFieldDef(page, section, key)
          const current = get(page, section, key, def?.field.defaultValue ?? '')
          return {
            page,
            section,
            key,
            fullKey: parsed.fullKey,
            label: def
              ? `${def.page.title} · ${def.section.title} · ${def.field.label}`
              : fullKey,
            type: def?.field.type ?? 'text',
            defaultValue: def?.field.defaultValue ?? '',
            value: current,
          }
        })
        .filter(Boolean)

      if (!matches.length) return

      if (matches.length > 1) {
        setEditing({
          kind: 'choose',
          matches,
          rect: el.getBoundingClientRect(),
          el,
        })
        return
      }

      const match = matches[0]
      setDraft(match.value)
      setEditing({
        kind: 'field',
        ...match,
        rect: el.getBoundingClientRect(),
        el,
        attr: el.getAttribute('data-cms-attr'),
      })
    },
    [get],
  )

  useEffect(() => {
    if (!inPreview || !pencilsOn) return undefined

    function findEditable(node) {
      if (!(node instanceof Element)) return null
      return node.closest('[data-cms-editable="1"], [data-cms-property-id]')
    }

    function onPointerMove(event) {
      if (editing) return
      const el = findEditable(event.target)
      if (!el) {
        setHoverTarget(null)
        return
      }
      const rect = el.getBoundingClientRect()
      const propertyId = el.getAttribute('data-cms-property-id')
      const propertySlug = el.getAttribute('data-cms-property-slug')
      setHoverTarget({
        el,
        rect,
        propertyId,
        propertySlug,
        isCms: el.getAttribute('data-cms-editable') === '1',
      })
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setEditing(null)
        setHoverTarget(null)
        setDrawerOpen(false)
      }
    }

    document.addEventListener('pointermove', onPointerMove, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointermove', onPointerMove, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [inPreview, pencilsOn, editing])

  async function resolveUserId() {
    if (!supabase) return null
    const {data} = await supabase.auth.getUser()
    return data.user?.id ?? null
  }

  async function saveField(match, nextValue) {
    setSaving(true)
    try {
      const userId = await resolveUserId()
      await saveContentValue(match.page, match.section, match.key, nextValue, userId)
      setValue(match.page, match.section, match.key, nextValue)
      postCmsSaved({
        page: match.page,
        section: match.section,
        key: match.key,
        label: match.label,
        value: nextValue,
      })
      toast.success('Saved')
      setEditing(null)
      setDrawerEditKey(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const sitewidePages = useMemo(
    () => new Set(['navbar', 'footer', 'cookies', 'inquiry', 'search', 'not-found']),
    [],
  )

  const drawerItems = useMemo(() => {
    const live = getRegistryEntries()
    const seen = new Set(live.map((e) => e.fullKey))
    const extras = []

    // Always include every field from the current route page + sitewide pages
    const pathPage = CONTENT_PAGES.find((p) => {
      const path = location.pathname.split('?')[0]
      if (p.id === 'home') return path === '/'
      if (p.path && p.path !== '/' && path.startsWith(p.path)) return true
      return path === p.path
    })

    const pagesToList = [
      ...(pathPage ? [pathPage] : []),
      ...CONTENT_PAGES.filter((p) => sitewidePages.has(p.id)),
    ]

    for (const page of pagesToList) {
      for (const section of page.sections) {
        for (const field of section.fields) {
          const fullKey = `${page.id}.${section.id}.${field.key}`
          if (seen.has(fullKey)) continue
          seen.add(fullKey)
          const value =
            fullKey in map
              ? map[fullKey]
              : get(page.id, section.id, field.key, field.defaultValue)
          extras.push({
            page: page.id,
            section: section.id,
            key: field.key,
            fullKey,
            value,
            label: `${page.title} · ${section.title} · ${field.label}`,
            type: field.type,
            defaultValue: field.defaultValue,
          })
        }
      }
    }

    const all = [
      ...live.map((e) => {
        const def = findFieldDef(e.page, e.section, e.key)
        return {
          ...e,
          label: def
            ? `${def.page.title} · ${def.section.title} · ${def.field.label}`
            : e.fullKey,
          type: def?.field.type ?? 'text',
          defaultValue: def?.field.defaultValue ?? '',
        }
      }),
      ...extras,
    ]

    const q = drawerQuery.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.fullKey.toLowerCase().includes(q) ||
        String(item.value).toLowerCase().includes(q),
    )
  }, [getRegistryEntries, registryVersion, location.pathname, sitewidePages, map, get, drawerQuery])

  if (!inPreview) return null

  const popupStyle = (() => {
    if (!editing?.rect) return {}
    const top = Math.min(editing.rect.bottom + 8, window.innerHeight - 320)
    const left = Math.min(Math.max(12, editing.rect.left), window.innerWidth - 360)
    return {top: Math.max(12, top), left}
  })()

  return (
    <div className="cms-inline-root">
      {pencilsOn && hoverTarget && !editing ? (
        <button
          type="button"
          className="cms-inline-pencil"
          style={{
            top: Math.max(8, hoverTarget.rect.top - 4),
            left: Math.min(hoverTarget.rect.right - 8, window.innerWidth - 44),
          }}
          title={hoverTarget.isCms ? 'Edit text' : 'Edit listing in Properties'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (hoverTarget.isCms) {
              openEditor(hoverTarget.el)
            } else if (hoverTarget.propertyId) {
              openEditor(hoverTarget.el, {
                id: hoverTarget.propertyId,
                slug: hoverTarget.propertySlug,
              })
            }
          }}
        >
          <Pencil size={14} aria-hidden />
        </button>
      ) : null}

      {editing?.kind === 'choose' ? (
        <div className="cms-inline-popup" style={popupStyle} role="dialog">
          <header>
            <strong>Which text?</strong>
            <button type="button" onClick={() => setEditing(null)} aria-label="Close">
              <X size={16} />
            </button>
          </header>
          <p className="cms-inline-popup__hint">This wording is used in more than one place.</p>
          <ul className="cms-inline-popup__choices">
            {editing.matches.map((m) => (
              <li key={m.fullKey}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(m.value)
                    setEditing({
                      kind: 'field',
                      ...m,
                      rect: editing.rect,
                      el: editing.el,
                    })
                  }}
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {editing?.kind === 'property' ? (
        <div className="cms-inline-popup" style={popupStyle} role="dialog">
          <header>
            <strong>Listing data</strong>
            <button type="button" onClick={() => setEditing(null)} aria-label="Close">
              <X size={16} />
            </button>
          </header>
          <p className="cms-inline-popup__hint">
            Titles, prices and descriptions are edited in the Properties admin — not Website Content.
          </p>
          <div className="cms-inline-popup__actions">
            <a
              className="cms-inline-btn cms-inline-btn--gold"
              href={`/admin/properties/${editing.propertyId}/edit`}
              target="_top"
              rel="noreferrer"
            >
              Open in Properties
            </a>
            <button type="button" className="cms-inline-btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {editing?.kind === 'field' ? (
        <div className="cms-inline-popup" style={popupStyle} role="dialog">
          <header>
            <strong>{editing.label}</strong>
            <button type="button" onClick={() => setEditing(null)} aria-label="Close">
              <X size={16} />
            </button>
          </header>
          {editing.type === 'textarea' ? (
            <textarea
              rows={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  void saveField(editing, draft)
                }
              }}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void saveField(editing, draft)
                }
              }}
              autoFocus
            />
          )}
          <div className="cms-inline-popup__meta">
            <span>{draft.length} characters</span>
            <button
              type="button"
              className="cms-inline-reset"
              onClick={() => setDraft(editing.defaultValue ?? '')}
              title="Reset to default"
            >
              <RotateCcw size={13} /> Default
            </button>
          </div>
          <div className="cms-inline-popup__actions">
            <button
              type="button"
              className="cms-inline-btn cms-inline-btn--gold"
              disabled={saving}
              onClick={() => void saveField(editing, draft)}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="cms-inline-btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="cms-inline-drawer-toggle"
        onClick={() => setDrawerOpen((v) => !v)}
        title="All texts on this page"
      >
        <List size={16} aria-hidden />
        All texts
      </button>

      {drawerOpen ? (
        <aside className="cms-inline-drawer" role="dialog" aria-label="All editable texts">
          <header>
            <strong>All texts on this page</strong>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </header>
          <label className="cms-inline-drawer__search">
            <Search size={14} aria-hidden />
            <input
              value={drawerQuery}
              onChange={(e) => setDrawerQuery(e.target.value)}
              placeholder="Search labels or text…"
            />
          </label>
          <ul className="cms-inline-drawer__list">
            {drawerItems.map((item) => {
              const isOpen = drawerEditKey === item.fullKey
              return (
                <li key={item.fullKey}>
                  <button
                    type="button"
                    className="cms-inline-drawer__item"
                    onClick={() => {
                      setDrawerEditKey(item.fullKey)
                      setDrawerDraft(item.value ?? '')
                    }}
                  >
                    <em>{item.label}</em>
                    <span>{item.value || '—'}</span>
                  </button>
                  {isOpen ? (
                    <div className="cms-inline-drawer__edit">
                      {item.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={drawerDraft}
                          onChange={(e) => setDrawerDraft(e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={drawerDraft}
                          onChange={(e) => setDrawerDraft(e.target.value)}
                        />
                      )}
                      <div className="cms-inline-popup__actions">
                        <button
                          type="button"
                          className="cms-inline-btn cms-inline-btn--gold"
                          disabled={saving}
                          onClick={() => void saveField(item, drawerDraft)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="cms-inline-btn"
                          onClick={() => setDrawerEditKey(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
          {drawerItems.length === 0 ? (
            <p className="cms-inline-drawer__empty">No matching texts.</p>
          ) : null}
        </aside>
      ) : null}

      {!pencilsOn ? (
        <div className="cms-inline-banner" role="status">
          <strong>Preview</strong>
          <span>Pencils are off — turn them on from the toolbar</span>
        </div>
      ) : null}
    </div>
  )
}
