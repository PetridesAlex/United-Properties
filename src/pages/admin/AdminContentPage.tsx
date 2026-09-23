import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react'
import {
  ExternalLink,
  Monitor,
  Pencil,
  RefreshCw,
  Smartphone,
  Tablet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {supabase} from '../../lib/supabase/client'
import {
  CMS_PREVIEW_READY,
  CMS_SAVED_MESSAGE,
  isCmsBridgeMessage,
  normalizeCmsPathname,
  postCmsEditMode,
  previewPathForCmsPage,
  readAdminEditToolsPreference,
  sameOrigin,
  writeAdminEditToolsPreference,
} from '../../lib/content/cmsPreview'
import {
  CONTENT_PAGES,
  getContentPage,
  getContentPageByPath,
  type ContentPageDef,
} from '../../lib/content/schema'
import '../../components/admin/AdminShell.css'
import './AdminContentPage.css'

type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

const PREVIEW_DEVICES: Array<{id: PreviewDevice; label: string; width: number | null; Icon: typeof Monitor}> =
  [
    {id: 'desktop', label: 'Desktop', width: null, Icon: Monitor},
    {id: 'tablet', label: 'Tablet', width: 834, Icon: Tablet},
    {id: 'mobile', label: 'Mobile', width: 390, Icon: Smartphone},
  ]

const HINT_KEY = 'up.contentCms.inlineHint.v1'

async function resolvePropertyPreviewPath(): Promise<string> {
  if (!supabase) return '/buy'
  const {data} = await supabase
    .from('properties')
    .select('slug')
    .eq('published', true)
    .order('updated_at', {ascending: false})
    .limit(1)
    .maybeSingle()
  if (data?.slug) return `/properties/${data.slug}`
  return '/buy'
}

export default function AdminContentPage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const iframePathRef = useRef('/')
  const [activePageId, setActivePageId] = useState('home')
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [pencilsOn, setPencilsOn] = useState(() => readAdminEditToolsPreference(true))
  const [previewKey, setPreviewKey] = useState(1)
  const [propertyPath, setPropertyPath] = useState('/buy')
  const [lastSaved, setLastSaved] = useState<{label: string; at: string} | null>(null)
  const [showHint, setShowHint] = useState(() => {
    try {
      return localStorage.getItem(HINT_KEY) !== '1'
    } catch {
      return true
    }
  })

  const activePage = useMemo(
    () => getContentPage(activePageId) ?? CONTENT_PAGES[0],
    [activePageId],
  )

  useEffect(() => {
    void resolvePropertyPreviewPath().then(setPropertyPath)
  }, [])

  const previewSrc = useMemo(() => {
    let path = previewPathForCmsPage(
      activePage.id,
      activePage.path || '/',
      iframePathRef.current || activePage.path || '/',
    )
    if (activePage.id === 'property') {
      path = propertyPath
    }
    const url = new URL(path, window.location.origin)
    url.searchParams.set('cmsPreview', String(previewKey || 1))
    if (pencilsOn) url.searchParams.set('cmsEdit', '1')
    return `${url.pathname}${url.search}`
  }, [activePage, previewKey, pencilsOn, propertyPath])

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!sameOrigin(event.origin)) return
      if (isCmsBridgeMessage(event.data, CMS_PREVIEW_READY)) {
        const pathname = normalizeCmsPathname(event.data.pathname)
        iframePathRef.current = pathname
        const matched = getContentPageByPath(pathname)
        if (matched && matched.id !== activePageId) {
          // Don't auto-switch away from sitewide chrome pages when browsing
          const sitewide = new Set(['navbar', 'footer', 'cookies', 'inquiry', 'search'])
          if (!sitewide.has(activePageId)) {
            setActivePageId(matched.id)
          }
        }
        if (pathname.startsWith('/properties/') && pathname !== '/properties') {
          if (activePageId === 'property' || activePageId === 'properties') {
            // keep
          }
        }
        return
      }
      if (isCmsBridgeMessage(event.data, CMS_SAVED_MESSAGE)) {
        const label = String(event.data.label || 'Content')
        const at = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        setLastSaved({label, at})
        toast.success(`Saved · ${label}`)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [activePageId])

  function onPageChange(pageId: string) {
    setActivePageId(pageId)
    setPreviewKey((k) => k + 1)
  }

  function onTogglePencils() {
    const next = !pencilsOn
    setPencilsOn(next)
    writeAdminEditToolsPreference(next)
    const win = iframeRef.current?.contentWindow
    if (win) postCmsEditMode(next, win)
  }

  function dismissHint() {
    setShowHint(false)
    try {
      localStorage.setItem(HINT_KEY, '1')
    } catch {
      // ignore
    }
  }

  const deviceMeta = PREVIEW_DEVICES.find((d) => d.id === device) ?? PREVIEW_DEVICES[0]
  const liveHref = previewPathForCmsPage(activePage.id, activePage.path || '/', '/')

  return (
    <div className="admin-page content-admin content-admin--clickedit">
      <header className="content-admin__toolbar">
        <div className="content-admin__toolbar-main">
          <div className="content-admin__toolbar-title">
            <p className="content-admin__eyebrow">Website Content</p>
            <h1>Edit the live site</h1>
          </div>

          <label className="content-admin__page-select">
            <span>Page</span>
            <select
              value={activePageId}
              onChange={(e) => onPageChange(e.target.value)}
            >
              {CONTENT_PAGES.map((page: ContentPageDef) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </label>

          <div className="content-admin__device-toggle" role="group" aria-label="Preview size">
            {PREVIEW_DEVICES.map(({id, label, Icon}) => (
              <button
                key={id}
                type="button"
                className={device === id ? 'is-active' : undefined}
                onClick={() => setDevice(id)}
                title={label}
              >
                <Icon size={16} aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`content-admin__pencils-toggle${pencilsOn ? ' is-on' : ''}`}
            onClick={onTogglePencils}
          >
            <Pencil size={15} aria-hidden />
            {pencilsOn ? 'Pencils on' : 'Pencils off'}
          </button>
        </div>

        <div className="content-admin__toolbar-side">
          {lastSaved ? (
            <p className="content-admin__last-saved" title={lastSaved.label}>
              Last saved: <strong>{lastSaved.label}</strong>
              <span> · {lastSaved.at}</span>
            </p>
          ) : (
            <p className="content-admin__last-saved content-admin__last-saved--muted">
              Hover any text and click the pencil to edit
            </p>
          )}
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => setPreviewKey((k) => k + 1)}
            title="Reload preview"
          >
            <RefreshCw size={15} aria-hidden />
          </button>
          <a
            className="admin-btn admin-btn--ghost"
            href={liveHref}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} aria-hidden />
            Live site
          </a>
        </div>
      </header>

      {showHint ? (
        <div className="content-admin__hint" role="status">
          <p>
            <strong>How to edit:</strong> hover any text on the website and click the gold pencil.
            Use <em>All texts</em> in the bottom-right for hidden labels (SEO, mobile menu, cookie
            banner).
          </p>
          <button type="button" onClick={dismissHint}>
            Got it
          </button>
        </div>
      ) : null}

      <section
        className={`content-admin__stage content-admin__stage--${device}`}
        style={
          deviceMeta.width
            ? ({'--preview-width': `${deviceMeta.width}px`} as CSSProperties)
            : undefined
        }
      >
        <div className="content-admin__preview-frame">
          <iframe
            key={previewSrc}
            ref={iframeRef}
            title={`Edit ${activePage.title}`}
            src={previewSrc}
            className="content-admin__iframe"
          />
        </div>
      </section>
    </div>
  )
}
