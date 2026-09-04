import {useEffect, useState} from 'react'
import {
  CMS_EDIT_MODE_MESSAGE,
  isCmsBridgeMessage,
  isCmsEditMode,
  isCmsPreviewMode,
  postCmsReady,
  postCmsSelect,
  resolveCmsTargetFromNode,
  sameOrigin,
} from '../../lib/content/cmsPreview'
import './CmsPreviewPicker.css'

/**
 * Runs inside the public site when opened as the CMS preview iframe.
 * Click-to-edit stays off until the admin enables editorial tools.
 */
export default function CmsPreviewPicker() {
  const inPreview = isCmsPreviewMode()
  const [editEnabled, setEditEnabled] = useState(() => (inPreview ? isCmsEditMode() : false))
  const [hint, setHint] = useState('Click any section to edit it')

  useEffect(() => {
    if (!inPreview) return undefined
    postCmsReady()
    // Parent may have toggled before this listener mounted.
    setEditEnabled(isCmsEditMode())

    function onMessage(event) {
      if (!sameOrigin(event.origin)) return
      if (!isCmsBridgeMessage(event.data, CMS_EDIT_MODE_MESSAGE)) return
      setEditEnabled(Boolean(event.data.enabled))
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [inPreview])

  useEffect(() => {
    if (!inPreview || !editEnabled) {
      document.documentElement.classList.remove('cms-preview-mode')
      document.querySelectorAll('.cms-preview-hot').forEach((el) => el.classList.remove('cms-preview-hot'))
      return undefined
    }

    document.documentElement.classList.add('cms-preview-mode')
    setHint('Click any section to edit it')

    let hoverEl = null

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
        setHint('Click any section to edit it')
        return
      }
      el.classList.add('cms-preview-hot')
      hoverEl = el
      setHint(`Edit · ${prettySection(target.section)}`)
    }

    function onPointerMove(event) {
      markHover(event.target)
    }

    function onClick(event) {
      // Re-check storage in case React state lagged behind the parent toggle.
      if (!isCmsEditMode() && !editEnabled) return

      const target = resolveCmsTargetFromNode(event.target)
      if (target?.page && target?.section) {
        event.preventDefault()
        event.stopPropagation()
        postCmsSelect(target.page, target.section)
        setHint(`Opening “${prettySection(target.section)}”…`)
        return
      }

      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (link) {
        event.preventDefault()
        event.stopPropagation()
        setHint('Click a content section to edit it')
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') clearHover()
    }

    document.addEventListener('pointermove', onPointerMove, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointermove', onPointerMove, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKeyDown)
      clearHover()
      document.documentElement.classList.remove('cms-preview-mode')
    }
  }, [inPreview, editEnabled])

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
    node.closest('section, header, footer, .hero-section, .navbar, .cta-section, .footer') || null
  )
}
