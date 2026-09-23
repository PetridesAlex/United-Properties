import {useEffect, useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {
  isCmsPreviewMode,
  postCmsReady,
  postCmsSelect,
  resolveCmsTargetFromNode,
  withCmsPreviewSearch,
} from '../../lib/content/cmsPreview'
import './CmsPreviewPicker.css'

/**
 * Runs inside the public site when opened as the CMS preview iframe.
 * Click any section to open its fields in the admin studio — always on in preview.
 */
export default function CmsPreviewPicker() {
  const location = useLocation()
  const navigate = useNavigate()
  const [inPreview, setInPreview] = useState(() => isCmsPreviewMode())
  const [hint, setHint] = useState('Click a section to edit it')

  useEffect(() => {
    setInPreview(isCmsPreviewMode())
  }, [location.pathname, location.search])

  // Keep preview markers on the URL while browsing pages inside the iframe.
  useEffect(() => {
    if (!inPreview) return
    const next = withCmsPreviewSearch(location.pathname, location.search, {edit: true})
    const current = `${location.pathname}${location.search || ''}`
    if (next !== current) {
      navigate(next, {replace: true})
    }
  }, [inPreview, location.pathname, location.search, navigate])

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

  useEffect(() => {
    if (!inPreview) {
      document.documentElement.classList.remove('cms-preview-mode')
      return undefined
    }

    let hoverEl = null
    let lastPickAt = 0

    function clearHover() {
      if (hoverEl) {
        hoverEl.classList.remove('cms-preview-hot')
        hoverEl = null
      }
    }

    function markHover(node) {
      const target = resolveCmsTargetFromNode(node)
      const el = node?.closest?.('[data-cms-page][data-cms-section]') || findSelectorEl(node)
      clearHover()
      if (!el || !target) {
        setHint('Click a section to edit it')
        return
      }
      // Don't highlight nav links as "edit" — those browse pages.
      if (isInternalNavLink(node)) {
        setHint('Open that page, then click a section')
        return
      }
      el.classList.add('cms-preview-hot')
      hoverEl = el
      setHint(`Edit · ${prettySection(target.section)}`)
    }

    function pickTarget(event) {
      const now = Date.now()
      if (now - lastPickAt < 350 && event.type === 'click') {
        event.preventDefault()
        event.stopPropagation()
        return true
      }

      // Internal links browse the site in the preview (About, Contact, etc.).
      if (isInternalNavLink(event.target)) {
        setHint('Opening page…')
        return false
      }

      const target = resolveCmsTargetFromNode(event.target)
      if (target?.page && target?.section) {
        event.preventDefault()
        event.stopPropagation()
        lastPickAt = now
        postCmsSelect(target.page, target.section)
        setHint(`Editing “${prettySection(target.section)}”`)
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
      if (event.button != null && event.button !== 0) return
      pickTarget(event)
    }

    function onClick(event) {
      pickTarget(event)
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') clearHover()
    }

    document.documentElement.classList.add('cms-preview-mode')
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
  }, [inPreview, location.pathname, location.key])

  if (!inPreview) return null

  return (
    <div className="cms-preview-banner" role="status">
      <span className="cms-preview-banner__pulse" aria-hidden />
      <strong>Click to edit</strong>
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

/** Same-site page links should navigate the preview, not open Navbar chrome. */
function isInternalNavLink(node) {
  if (!node || !(node instanceof Element)) return false
  const link = node.closest('a[href]')
  if (!link) return false
  const href = link.getAttribute('href') || ''
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return false
  }
  if (/^https?:\/\//i.test(href)) {
    try {
      return new URL(href).origin === window.location.origin
    } catch {
      return false
    }
  }
  return href.startsWith('/')
}
