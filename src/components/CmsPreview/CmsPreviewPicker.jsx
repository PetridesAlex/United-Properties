import {useEffect, useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {
  CMS_EDIT_MODE_MESSAGE,
  isCmsBridgeMessage,
  isCmsEditMode,
  isCmsPreviewMode,
  postCmsReady,
  postCmsSelect,
  resolveCmsTargetFromNode,
  sameOrigin,
  setCmsEditToolsPreference,
  withCmsPreviewSearch,
} from '../../lib/content/cmsPreview'
import './CmsPreviewPicker.css'

/**
 * Runs inside the public site when opened as the CMS preview iframe.
 * Keeps preview/edit query params across client navigations and always
 * rebinds click-to-edit so it works after save / refresh / page changes.
 */
export default function CmsPreviewPicker() {
  const location = useLocation()
  const navigate = useNavigate()
  const inPreview = isCmsPreviewMode()
  const [editEnabled, setEditEnabled] = useState(() => isCmsEditMode())
  const [hint, setHint] = useState('Click any section to edit it')
  const editRef = useRef(editEnabled)
  editRef.current = editEnabled

  // Preserve ?cmsPreview / ?cmsEdit while browsing inside the iframe.
  useEffect(() => {
    if (!inPreview) return
    const next = withCmsPreviewSearch(location.pathname, location.search, {
      edit: editRef.current || isCmsEditMode(),
    })
    const current = `${location.pathname}${location.search || ''}`
    if (next !== current) {
      navigate(next, {replace: true})
    }
  }, [inPreview, location.pathname, location.search, editEnabled, navigate])

  // Announce ready + accept parent edit-mode messages. Re-run on every route.
  useEffect(() => {
    if (!inPreview) return undefined

    const syncFromEnv = () => {
      const on = isCmsEditMode()
      setEditEnabled(on)
      editRef.current = on
    }

    syncFromEnv()
    postCmsReady()
    let pulses = 0
    const readyPulse = window.setInterval(() => {
      postCmsReady()
      pulses += 1
      if (pulses >= 8) window.clearInterval(readyPulse)
    }, 700)

    function onMessage(event) {
      if (!sameOrigin(event.origin)) return
      if (!isCmsBridgeMessage(event.data, CMS_EDIT_MODE_MESSAGE)) return
      const enabled = Boolean(event.data.enabled)
      setCmsEditToolsPreference(enabled)
      editRef.current = enabled
      setEditEnabled(enabled)
    }

    window.addEventListener('message', onMessage)
    // Re-sync if the parent remounted the iframe with cmsEdit in the URL.
    const t = window.setTimeout(syncFromEnv, 50)

    return () => {
      window.clearInterval(readyPulse)
      window.clearTimeout(t)
      window.removeEventListener('message', onMessage)
    }
  }, [inPreview, location.key])

  useEffect(() => {
    if (!inPreview) {
      document.documentElement.classList.remove('cms-preview-mode')
      return undefined
    }

    let hoverEl = null

    function clearHover() {
      if (hoverEl) {
        hoverEl.classList.remove('cms-preview-hot')
        hoverEl = null
      }
    }

    function toolsOn() {
      return editRef.current || isCmsEditMode()
    }

    function markHover(node) {
      if (!toolsOn()) {
        clearHover()
        return
      }
      const target = resolveCmsTargetFromNode(node)
      const el = node?.closest?.('[data-cms-page][data-cms-section]') || findSelectorEl(node)
      clearHover()
      if (!el || !target) {
        setHint('Click any section to edit it')
        return
      }
      el.classList.add('cms-preview-hot')
      hoverEl = el
      setHint(`Edit · ${prettySection(target.section)}`)
    }

    let lastPickAt = 0

    function pickTarget(event) {
      if (!toolsOn()) return false

      // Avoid double-firing from pointerdown + click.
      const now = Date.now()
      if (now - lastPickAt < 350 && event.type === 'click') {
        event.preventDefault()
        event.stopPropagation()
        return true
      }

      const target = resolveCmsTargetFromNode(event.target)
      if (target?.page && target?.section) {
        event.preventDefault()
        event.stopPropagation()
        lastPickAt = now
        postCmsSelect(target.page, target.section)
        setHint(`Opening “${prettySection(target.section)}”…`)
        return true
      }

      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (link) {
        const href = link.getAttribute('href') || ''
        if (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
          event.preventDefault()
          event.stopPropagation()
          setHint('Click a content section to edit it')
          return true
        }
      }
      return false
    }

    function onPointerMove(event) {
      markHover(event.target)
    }

    function onPointerDown(event) {
      // Capture early so nested handlers / Framer Motion don't swallow the pick.
      if (event.button != null && event.button !== 0) return
      pickTarget(event)
    }

    function onClick(event) {
      pickTarget(event)
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') clearHover()
    }

    function applyModeClass() {
      if (toolsOn()) document.documentElement.classList.add('cms-preview-mode')
      else document.documentElement.classList.remove('cms-preview-mode')
    }

    applyModeClass()

    document.addEventListener('pointermove', onPointerMove, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointermove', onPointerMove, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKeyDown)
      clearHover()
      document.documentElement.classList.remove('cms-preview-mode')
    }
  }, [inPreview, editEnabled, location.pathname, location.key])

  if (!inPreview || !editEnabled) return null

  return (
    <div className="cms-preview-banner" role="status">
      <span className="cms-preview-banner__pulse" aria-hidden />
      <strong>Edit mode</strong>
      <span>{hint}</span>
    </div>
  )
}

function prettySection(section) {
  return String(section || '').replace(/_/g, ' ')
}

function findSelectorEl(node) {
  if (!node || !(node instanceof Element)) return null
  const marked = node.closest('[data-cms-page][data-cms-section]')
  if (marked) return marked
  return (
    node.closest(
      'section, header, footer, .hero-section, .navbar, .cta-section, .footer, .page-hero',
    ) || null
  )
}
