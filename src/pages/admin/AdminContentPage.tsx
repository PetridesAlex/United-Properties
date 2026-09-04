import {useEffect, useMemo, useRef, useState} from 'react'
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Globe2,
  LayoutTemplate,
  Menu,
  Monitor,
  MousePointer2,
  RefreshCw,
  Save,
  Search,
  Smartphone,
  Tablet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {fetchSiteContentMap, savePageContent} from '../../lib/content/api'
import {flushSync} from 'react-dom'
import {
  CMS_PREVIEW_MESSAGE,
  CMS_PREVIEW_READY,
  isCmsBridgeMessage,
  postCmsEditMode,
  sameOrigin,
  setCmsEditToolsPreference,
} from '../../lib/content/cmsPreview'
import {
  contentKey,
  getContentCatalogGroups,
  getContentPage,
  getDefaultContentMap,
  type ContentPageDef,
  type ContentSectionDef,
} from '../../lib/content/schema'
import '../../components/admin/AdminShell.css'
import './AdminContentPage.css'

const PROGRESS_KEY = 'up.contentCms.v2'

type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

const PREVIEW_DEVICES: Array<{id: PreviewDevice; label: string; width: number | null}> = [
  {id: 'desktop', label: 'Desktop', width: null},
  {id: 'tablet', label: 'Tablet', width: 834},
  {id: 'mobile', label: 'Mobile', width: 390},
]

type ContentProgress = {
  activePageId: string | null
  activeSectionId: string | null
  values: Record<string, string>
  savedSnapshot: Record<string, string>
  scrollY: number
  updatedAt: string
}

function readProgress(): ContentProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ContentProgress>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      activePageId: typeof parsed.activePageId === 'string' ? parsed.activePageId : null,
      activeSectionId: typeof parsed.activeSectionId === 'string' ? parsed.activeSectionId : null,
      values: parsed.values && typeof parsed.values === 'object' ? parsed.values : {},
      savedSnapshot:
        parsed.savedSnapshot && typeof parsed.savedSnapshot === 'object' ? parsed.savedSnapshot : {},
      scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : 0,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

function writeProgress(progress: Omit<ContentProgress, 'updatedAt'>) {
  try {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        ...progress,
        updatedAt: new Date().toISOString(),
      } satisfies ContentProgress),
    )
  } catch {
    // Ignore quota / private mode.
  }
}

function pageIcon(pageId: string) {
  if (pageId === 'navbar' || pageId === 'footer' || pageId === 'cookies' || pageId === 'search') {
    return Menu
  }
  if (pageId === 'inquiry') return LayoutTemplate
  return Globe2
}

function pathLabel(path: string) {
  if (!path || path === '/') return 'unitedproperties.eu'
  return path.replace(/^\//, '')
}

type FieldGroup = {
  id: string
  title: string | null
  kind: 'general' | 'card'
  fields: ContentSectionDef['fields']
}

/** Group card1_title/card1_body… into clear Card 1 / Card 2 blocks; keep other fields first. */
function groupSectionFields(fields: ContentSectionDef['fields']): FieldGroup[] {
  const general: ContentSectionDef['fields'] = []
  const cards = new Map<string, ContentSectionDef['fields']>()

  for (const field of fields) {
    const match = /^card(\d+)_(.+)$/i.exec(field.key)
    if (!match) {
      general.push(field)
      continue
    }
    const num = match[1]
    const list = cards.get(num) ?? []
    list.push(field)
    cards.set(num, list)
  }

  const groups: FieldGroup[] = []
  if (general.length) {
    groups.push({id: 'general', title: null, kind: 'general', fields: general})
  }

  const cardNums = [...cards.keys()].sort((a, b) => Number(a) - Number(b))
  for (const num of cardNums) {
    groups.push({
      id: `card-${num}`,
      title: `Card ${num}`,
      kind: 'card',
      fields: cards.get(num) ?? [],
    })
  }

  return groups
}

export default function AdminContentPage() {
  const {user} = useAdminAuth()
  const defaults = useMemo(() => getDefaultContentMap(), [])
  const cached = useMemo(() => readProgress(), [])

  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...defaults,
    ...(cached?.values ?? {}),
  }))
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>(() => ({
    ...defaults,
    ...(cached?.savedSnapshot ?? cached?.values ?? {}),
  }))
  const [loading, setLoading] = useState(() => !cached)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [previewKey, setPreviewKey] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
  const [clickFlash, setClickFlash] = useState(false)
  const [editToolsOn, setEditToolsOn] = useState(false)
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null)
  const pendingJumpRef = useRef<string | null>(null)
  const focusFromPreviewRef = useRef<(pageId: string, sectionId: string) => void>(() => {})
  const [activePageId, setActivePageId] = useState<string | null>(() => {
    if (cached?.activePageId && getContentPage(cached.activePageId)) return cached.activePageId
    return null
  })
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    () => cached?.activeSectionId ?? null,
  )

  const activePage = activePageId ? getContentPage(activePageId) : undefined
  const valuesRef = useRef(values)
  const savedRef = useRef(savedSnapshot)
  const pageRef = useRef(activePageId)
  const sectionRef = useRef(activeSectionId)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoredScroll = useRef(false)
  const editorScrollRef = useRef<HTMLDivElement | null>(null)

  valuesRef.current = values
  savedRef.current = savedSnapshot
  pageRef.current = activePageId
  sectionRef.current = activeSectionId

  useEffect(() => {
    let cancelled = false
    async function load() {
      const map = await fetchSiteContentMap()
      if (cancelled) return

      setValues((prev) => {
        const next = {...defaults, ...map}
        for (const [key, value] of Object.entries(prev)) {
          const saved = savedRef.current[key] ?? ''
          if (value !== saved) next[key] = value
        }
        return next
      })
      setSavedSnapshot((prev) => {
        const next = {...defaults, ...map}
        for (const [key, value] of Object.entries(prev)) {
          if ((valuesRef.current[key] ?? '') !== value) next[key] = value
        }
        return next
      })
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [defaults])

  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      writeProgress({
        activePageId,
        activeSectionId,
        values,
        savedSnapshot,
        scrollY: window.scrollY || 0,
      })
    }, 400)
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [activePageId, activeSectionId, values, savedSnapshot])

  useEffect(() => {
    function onScroll() {
      if (persistTimer.current) clearTimeout(persistTimer.current)
      persistTimer.current = setTimeout(() => {
        writeProgress({
          activePageId: pageRef.current,
          activeSectionId: sectionRef.current,
          values: valuesRef.current,
          savedSnapshot: savedRef.current,
          scrollY: window.scrollY || 0,
        })
      }, 500)
    }
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (loading || restoredScroll.current) return
    const y = cached?.scrollY ?? 0
    if (y > 0 && cached?.activePageId === activePageId) {
      restoredScroll.current = true
      requestAnimationFrame(() => window.scrollTo(0, y))
    } else {
      restoredScroll.current = true
    }
  }, [loading, activePageId, cached])

  useEffect(() => {
    if (!activePage) return
    const valid = activePage.sections.some((section) => section.id === activeSectionId)
    if (!valid) setActiveSectionId(activePage.sections[0]?.id ?? null)
  }, [activePage, activeSectionId])

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!sameOrigin(event.origin)) return
      const data = event.data
      if (isCmsBridgeMessage(data, CMS_PREVIEW_READY)) {
        const frameWindow = previewFrameRef.current?.contentWindow
        if (frameWindow) postCmsEditMode(editToolsOn, frameWindow)
        return
      }
      if (!isCmsBridgeMessage(data, CMS_PREVIEW_MESSAGE)) return
      if (typeof data.page !== 'string' || typeof data.section !== 'string') return
      focusFromPreviewRef.current(data.page, data.section)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [editToolsOn])

  useEffect(() => {
    setCmsEditToolsPreference(editToolsOn)
    const frameWindow = previewFrameRef.current?.contentWindow
    if (!frameWindow || !previewOpen) return

    postCmsEditMode(editToolsOn, frameWindow)
    const t1 = window.setTimeout(() => postCmsEditMode(editToolsOn, frameWindow), 120)
    const t2 = window.setTimeout(() => postCmsEditMode(editToolsOn, frameWindow), 400)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [editToolsOn, previewOpen, previewKey, activePageId])

  useEffect(() => {
    if (!pendingJumpRef.current) return
    const sectionId = pendingJumpRef.current
    pendingJumpRef.current = null
    const timer = window.setTimeout(() => jumpToSection(sectionId), 80)
    return () => window.clearTimeout(timer)
    // jumpToSection is stable enough via DOM ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId, activePage])

  const dirty = useMemo(() => {
    if (!activePage) return false
    for (const section of activePage.sections) {
      for (const field of section.fields) {
        const key = contentKey(activePage.id, section.id, field.key)
        if ((values[key] ?? '') !== (savedSnapshot[key] ?? '')) return true
      }
    }
    return false
  }, [activePage, values, savedSnapshot])

  function setField(pageId: string, sectionId: string, fieldKey: string, next: string) {
    const key = contentKey(pageId, sectionId, fieldKey)
    setValues((prev) => ({...prev, [key]: next}))
  }

  function sectionDirty(page: ContentPageDef, sectionId: string) {
    const section = page.sections.find((s) => s.id === sectionId)
    if (!section) return false
    for (const field of section.fields) {
      const key = contentKey(page.id, section.id, field.key)
      if ((values[key] ?? '') !== (savedSnapshot[key] ?? '')) return true
    }
    return false
  }

  function pageDirty(page: ContentPageDef) {
    return page.sections.some((section) => sectionDirty(page, section.id))
  }

  const catalogGroups = useMemo(() => getContentCatalogGroups(), [])

  const visibleSections = useMemo(() => {
    if (!activePage) return [] as ContentSectionDef[]
    const q = query.trim().toLowerCase()
    if (!q) return activePage.sections
    return activePage.sections.filter((section) => {
      if (section.id === activeSectionId) return true
      if (section.title.toLowerCase().includes(q) || section.description.toLowerCase().includes(q)) {
        return true
      }
      return section.fields.some(
        (field) =>
          field.label.toLowerCase().includes(q) ||
          field.key.toLowerCase().includes(q) ||
          field.defaultValue.toLowerCase().includes(q),
      )
    })
  }, [activePage, activeSectionId, query])

  const previewSrc = useMemo(() => {
    if (!activePage) return '/'
    const url = new URL(activePage.path || '/', window.location.origin)
    url.searchParams.set('cmsPreview', String(previewKey))
    return `${url.pathname}${url.search}`
  }, [activePage, previewKey])

  function openPage(pageId: string) {
    const page = getContentPage(pageId)
    restoredScroll.current = true
    setQuery('')
    setActivePageId(pageId)
    setActiveSectionId(page?.sections[0]?.id ?? null)
    setPreviewKey((n) => n + 1)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }

  function jumpToSection(sectionId: string) {
    setActiveSectionId(sectionId)
    requestAnimationFrame(() => {
      const el = document.getElementById(`cms-section-${sectionId}`)
      if (!el) return
      const field = el.querySelector('input, textarea')
      if (field instanceof HTMLElement) {
        field.focus({preventScroll: true})
      }
    })
  }

  function focusFromPreview(pageId: string, sectionId: string) {
    const page = getContentPage(pageId)
    if (!page) {
      toast.error('That area isn’t linked to editable copy yet')
      return
    }

    const nextSection = page.sections.some((s) => s.id === sectionId)
      ? sectionId
      : page.sections[0]?.id ?? null
    const sectionTitle =
      page.sections.find((s) => s.id === nextSection)?.title || nextSection || 'section'

    flushSync(() => {
      setPreviewOpen(true)
      setEditToolsOn(true)
      setQuery('')
      setClickFlash(true)
      setCmsEditToolsPreference(true)
    })
    window.setTimeout(() => setClickFlash(false), 1000)

    if (pageId !== activePageId) {
      restoredScroll.current = true
      if (nextSection) pendingJumpRef.current = nextSection
      flushSync(() => {
        setActivePageId(pageId)
        setActiveSectionId(nextSection)
      })
      toast.success(`Editing · ${page.title} · ${sectionTitle}`)
      return
    }

    if (nextSection) {
      jumpToSection(nextSection)
      toast.success(`Editing · ${sectionTitle}`)
    }
  }

  focusFromPreviewRef.current = focusFromPreview

  function backToCatalog() {
    if (dirty && !window.confirm('You have unsaved changes. Leave this page?')) return
    restoredScroll.current = true
    setActivePageId(null)
    setActiveSectionId(null)
    setQuery('')
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }

  function refreshPreview() {
    setPreviewKey((n) => n + 1)
    toast.success('Preview refreshed')
  }

  function toggleEditTools() {
    setEditToolsOn((on) => {
      const next = !on
      setCmsEditToolsPreference(next)
      toast.success(next ? 'Click-to-edit enabled — click a section in the preview' : 'Browse mode — click the site normally')
      return next
    })
    if (!previewOpen) setPreviewOpen(true)
  }

  async function onSavePage() {
    if (!activePage) return
    setSaving(true)
    try {
      await savePageContent(activePage, values, user?.id)
      const nextSnapshot = {...savedSnapshot}
      for (const section of activePage.sections) {
        for (const field of section.fields) {
          const key = contentKey(activePage.id, section.id, field.key)
          nextSnapshot[key] = values[key] ?? ''
        }
      }
      setSavedSnapshot(nextSnapshot)
      writeProgress({
        activePageId,
        activeSectionId,
        values,
        savedSnapshot: nextSnapshot,
        scrollY: window.scrollY || 0,
      })
      setPreviewKey((n) => n + 1)
      toast.success('Saved — preview updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="admin-empty">Loading website content…</p>

  if (!activePage) {
    return (
      <div className="admin-page content-admin content-admin--catalog">
        <header className="content-admin__hero content-admin__hero--simple">
          <div className="content-admin__hero-copy">
            <p className="content-admin__eyebrow">Website text</p>
            <h1>Edit like you browse</h1>
            <p className="content-admin__lede">
              Pick the same page your visitors open. Then change the words you see — with a live preview
              beside the editor.
            </p>
          </div>
        </header>

        <div className="content-admin__catalog">
          {catalogGroups.map((group) => (
            <section key={group.id} className="content-admin__group">
              <header className="content-admin__group-head">
                <div>
                  <h2 className="content-admin__group-title">{group.title}</h2>
                  <p className="content-admin__group-blurb">{group.blurb}</p>
                </div>
              </header>
              <div className="content-admin__sitemap">
                {group.ids.map((id) => {
                  const page = getContentPage(id)
                  if (!page) return null
                  const Icon = pageIcon(page.id)
                  const hasDraft = pageDirty(page)
                  return (
                    <button
                      key={page.id}
                      type="button"
                      className="content-admin__site-row"
                      onClick={() => openPage(page.id)}
                    >
                      <span className="content-admin__site-icon" aria-hidden>
                        <Icon size={18} strokeWidth={2} />
                      </span>
                      <span className="content-admin__site-copy">
                        <strong>{page.title}</strong>
                        <span>{page.description}</span>
                      </span>
                      <span className="content-admin__site-meta">
                        <em>{pathLabel(page.path)}</em>
                        {hasDraft ? <b>Unsaved</b> : null}
                        <span className="content-admin__site-cta">Edit</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    )
  }

  const activeSection =
    activePage.sections.find((section) => section.id === activeSectionId) ??
    activePage.sections[0] ??
    null

  return (
    <div className="admin-page content-admin content-admin--studio">
      <header className="content-admin__studio-bar">
        <div className="content-admin__studio-intro">
          <button type="button" className="content-admin__back" onClick={backToCatalog}>
            <ArrowLeft size={16} aria-hidden />
            All pages
          </button>
          <div>
            <p className="content-admin__eyebrow">Editing</p>
            <h1>{activePage.title}</h1>
            <p className="content-admin__path">{pathLabel(activePage.path)}</p>
          </div>
        </div>

        <div className="content-admin__studio-actions">
          {dirty ? <span className="content-admin__dirty">Unsaved changes</span> : null}
          <button
            type="button"
            className={`admin-btn${editToolsOn ? ' admin-btn--gold' : ' admin-btn--ghost'}`}
            aria-pressed={editToolsOn}
            onClick={toggleEditTools}
          >
            <MousePointer2 size={15} aria-hidden />
            {editToolsOn ? 'Click to edit: On' : 'Click to edit: Off'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => setPreviewOpen((open) => !open)}
          >
            <Eye size={15} aria-hidden />
            {previewOpen ? 'Hide preview' : 'Show preview'}
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={refreshPreview}>
            <RefreshCw size={15} aria-hidden />
            Refresh
          </button>
          <a
            className="admin-btn admin-btn--ghost"
            href={activePage.path}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} aria-hidden />
            Open live
          </a>
          <button
            type="button"
            className="admin-btn admin-btn--gold"
            disabled={saving || !dirty}
            onClick={() => void onSavePage()}
          >
            <Save size={15} aria-hidden />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      <div className={`content-admin__studio${previewOpen ? ' has-preview' : ' is-editor-only'}`}>
        <section className="content-admin__workspace" aria-label="Edit page copy">
          <div className="content-admin__workspace-intro">
            <h2>Edit this section</h2>
            <p>
              Pick a category below — or turn on <strong>Click to edit</strong> and click it in the
              preview. Only the selected section is shown.
            </p>
          </div>

          <div className="content-admin__workspace-tools">
            <label className="content-admin__find">
              <Search size={15} aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter categories…"
                aria-label="Filter categories"
              />
            </label>
            <p className="content-admin__workspace-hint">
              {activePage.sections.length} categories
            </p>
          </div>

          <nav className="content-admin__jump" aria-label="Page categories">
            {activePage.sections.map((section) => {
              const hidden = query.trim() && !visibleSections.some((s) => s.id === section.id)
              if (hidden) return null
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`content-admin__jump-btn${
                    section.id === activeSectionId ? ' is-active' : ''
                  }${sectionDirty(activePage, section.id) ? ' is-dirty' : ''}`}
                  onClick={() => jumpToSection(section.id)}
                >
                  {section.title}
                </button>
              )
            })}
          </nav>

          <div className="content-admin__scroll" ref={editorScrollRef}>
            {!activeSection ? (
              <p className="content-admin__empty-find">Choose a category to edit.</p>
            ) : (
              <article
                key={activeSection.id}
                id={`cms-section-${activeSection.id}`}
                className={`content-admin__block is-active${clickFlash ? ' is-flash' : ''}`}
              >
                <header className="content-admin__block-head">
                  <div>
                    <h2>{activeSection.title}</h2>
                    <p>{activeSection.description}</p>
                  </div>
                  <div className="content-admin__block-meta">
                    <span className="content-admin__block-count">
                      {activeSection.fields.length} field
                      {activeSection.fields.length === 1 ? '' : 's'}
                    </span>
                    {sectionDirty(activePage, activeSection.id) ? (
                      <span className="content-admin__block-dirty">Edited</span>
                    ) : null}
                  </div>
                </header>

                <div className="content-admin__fields">
                  {groupSectionFields(activeSection.fields).map((group) => (
                    <div
                      key={group.id}
                      className={`content-admin__field-group${
                        group.kind === 'card' ? ' content-admin__field-group--card' : ''
                      }`}
                    >
                      {group.title ? (
                        <h3 className="content-admin__field-group-title">{group.title}</h3>
                      ) : null}
                      {group.fields.map((field) => {
                        const key = contentKey(activePage.id, activeSection.id, field.key)
                        const value = values[key] ?? ''
                        return (
                          <div className="admin-field content-admin__field" key={key}>
                            <label htmlFor={key}>{field.label}</label>
                            {field.help ? <p className="content-admin__help">{field.help}</p> : null}
                            {field.type === 'textarea' ? (
                              <textarea
                                id={key}
                                rows={field.rows ?? 4}
                                value={value}
                                placeholder={field.defaultValue}
                                onChange={(e) =>
                                  setField(
                                    activePage.id,
                                    activeSection.id,
                                    field.key,
                                    e.target.value,
                                  )
                                }
                              />
                            ) : (
                              <input
                                id={key}
                                value={value}
                                placeholder={field.defaultValue}
                                onChange={(e) =>
                                  setField(
                                    activePage.id,
                                    activeSection.id,
                                    field.key,
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>
        </section>

        {previewOpen ? (
          <section className="content-admin__preview" aria-label="Live page preview">
            <div className="content-admin__preview-chrome">
              <span className="content-admin__preview-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span className="content-admin__preview-url">{pathLabel(activePage.path)}</span>
              <div className="content-admin__device-switch" role="group" aria-label="Preview device">
                {PREVIEW_DEVICES.map((device) => {
                  const Icon =
                    device.id === 'desktop' ? Monitor : device.id === 'tablet' ? Tablet : Smartphone
                  return (
                    <button
                      key={device.id}
                      type="button"
                      className={`content-admin__device-btn${
                        previewDevice === device.id ? ' is-active' : ''
                      }`}
                      aria-pressed={previewDevice === device.id}
                      title={device.label}
                      onClick={() => setPreviewDevice(device.id)}
                    >
                      <Icon size={14} strokeWidth={2.1} aria-hidden />
                      <span>{device.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className={`content-admin__preview-stage content-admin__preview-stage--${previewDevice}`}>
              <div className="content-admin__preview-frame-shell">
                <iframe
                  ref={previewFrameRef}
                  key={previewSrc}
                  className="content-admin__preview-frame"
                  title={`${activePage.title} preview`}
                  src={previewSrc}
                  onLoad={() => {
                    const frameWindow = previewFrameRef.current?.contentWindow
                    if (frameWindow) postCmsEditMode(editToolsOn, frameWindow)
                  }}
                />
              </div>
            </div>
            <p className={`content-admin__preview-tip${editToolsOn ? ' is-edit-on' : ''}`}>
              {editToolsOn
                ? 'Edit mode on — click a gold-outlined section in the preview. Its fields open on the left.'
                : 'Browse mode — use the site normally in the preview. Turn on “Click to edit” when you want to pick a section.'}
            </p>
          </section>
        ) : null}
      </div>

      <div className="content-admin__footer-bar">
        <p>Save to update the live site. Preview refreshes automatically after save.</p>
        <button
          type="button"
          className="admin-btn admin-btn--gold"
          disabled={saving || !dirty}
          onClick={() => void onSavePage()}
        >
          {saving ? 'Saving…' : 'Save this page'}
        </button>
      </div>
    </div>
  )
}
