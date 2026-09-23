/** CMS click-to-edit preview bridge (iframe ↔ admin). */

export const CMS_PREVIEW_READY = 'up-cms-ready'
export const CMS_EDIT_MODE_MESSAGE = 'up-cms-edit-mode'
export const CMS_SAVED_MESSAGE = 'up-cms-saved'
export const CMS_PREVIEW_QUERY = 'cmsPreview'
export const CMS_EDIT_QUERY = 'cmsEdit'
/** Survives in-iframe client navigations that drop ?cmsPreview= */
export const CMS_PREVIEW_STORAGE_KEY = 'up.cmsPreviewFrame'
/** Iframe-only edit-tools flag (do not share with admin React state writes). */
export const CMS_EDIT_STORAGE_KEY = 'up.cmsEditTools.iframe'
/** Admin studio preference — survives save / remount of the editor page. */
export const CMS_EDIT_ADMIN_STORAGE_KEY = 'up.cmsEditTools.admin'

function isFramedWindow() {
  if (typeof window === 'undefined') return false
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

function readStorage(key) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // ignore quota / private mode
  }
}

export function isCmsPreviewMode() {
  if (typeof window === 'undefined') return false
  const framed = isFramedWindow()
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.has(CMS_PREVIEW_QUERY)) {
      if (framed) writeStorage(CMS_PREVIEW_STORAGE_KEY, '1')
      return true
    }
    return framed && readStorage(CMS_PREVIEW_STORAGE_KEY) === '1'
  } catch {
    return framed
  }
}

export function isCmsEditMode() {
  if (typeof window === 'undefined') return false
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get(CMS_EDIT_QUERY) === '1') {
      writeStorage(CMS_EDIT_STORAGE_KEY, '1')
      return true
    }
    if (params.get(CMS_EDIT_QUERY) === '0') {
      writeStorage(CMS_EDIT_STORAGE_KEY, '0')
      return false
    }
    return readStorage(CMS_EDIT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setCmsEditToolsPreference(enabled) {
  if (typeof window === 'undefined') return
  writeStorage(CMS_EDIT_STORAGE_KEY, enabled ? '1' : '0')
}

export function readAdminEditToolsPreference(fallback = true) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(CMS_EDIT_ADMIN_STORAGE_KEY)
    if (raw === '0') return false
    if (raw === '1') return true
  } catch {
    // ignore
  }
  return fallback
}

export function writeAdminEditToolsPreference(enabled) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CMS_EDIT_ADMIN_STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    // ignore
  }
}

/** Keep cmsPreview / cmsEdit on the URL while browsing inside the preview iframe. */
export function withCmsPreviewSearch(pathname, search = '', {edit = isCmsEditMode()} = {}) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  if (!params.has(CMS_PREVIEW_QUERY)) params.set(CMS_PREVIEW_QUERY, '1')
  if (edit) params.set(CMS_EDIT_QUERY, '1')
  else params.delete(CMS_EDIT_QUERY)
  const q = params.toString()
  return `${pathname || '/'}${q ? `?${q}` : ''}`
}

export function cmsRegionProps(page, section) {
  return {
    'data-cms-page': page,
    'data-cms-section': section,
  }
}

/** Chrome / overlays that appear on many routes — preview should keep the browsed URL. */
export const CMS_SHARED_CHROME_PAGE_IDS = new Set([
  'navbar',
  'footer',
  'cookies',
  'inquiry',
  'search',
])

export function isCmsSharedChromePage(pageId) {
  return CMS_SHARED_CHROME_PAGE_IDS.has(String(pageId || ''))
}

/** Canonical preview path for a CMS page id (shared chrome keeps currentPath). */
export function previewPathForCmsPage(pageId, pagePath, currentPath = '/') {
  const id = String(pageId || '')
  if (id === 'inquiry') {
    return pagePath || '/contact'
  }
  if (id === 'not-found') {
    return '/__cms-preview-404__'
  }
  if (id === 'property') {
    return currentPath && currentPath.startsWith('/properties/')
      ? currentPath
      : pagePath || '/properties'
  }
  if (isCmsSharedChromePage(id)) {
    return currentPath && currentPath.startsWith('/') ? currentPath : pagePath || '/'
  }
  return pagePath || '/'
}

/** Normalize a pathname for CMS path matching (strip query/hash). */
export function normalizeCmsPathname(pathname) {
  const raw = String(pathname || '/')
  const path = raw.split('?')[0].split('#')[0] || '/'
  return path.startsWith('/') ? path : `/${path}`
}

function sameOrigin(eventOrigin) {
  if (!eventOrigin || eventOrigin === 'null') return true
  try {
    if (eventOrigin === window.location.origin) return true
    const incoming = new URL(eventOrigin)
    const here = new URL(window.location.origin)
    const localHosts = new Set(['localhost', '127.0.0.1'])
    if (
      incoming.port === here.port &&
      localHosts.has(incoming.hostname) &&
      localHosts.has(here.hostname)
    ) {
      return true
    }
    return incoming.host === here.host
  } catch {
    return false
  }
}

export function isCmsBridgeMessage(data, type) {
  return Boolean(data && data.source === 'united-properties-cms' && data.type === type)
}

export function postCmsReady() {
  if (typeof window === 'undefined') return
  const payload = {
    source: 'united-properties-cms',
    type: CMS_PREVIEW_READY,
    pathname: window.location.pathname || '/',
  }
  const target = window.parent && window.parent !== window ? window.parent : null
  if (!target) return
  target.postMessage(payload, '*')
}

export function postCmsSaved({page, section, key, label, value}) {
  if (typeof window === 'undefined') return
  const target = window.parent && window.parent !== window ? window.parent : null
  if (!target) return
  target.postMessage(
    {
      source: 'united-properties-cms',
      type: CMS_SAVED_MESSAGE,
      page,
      section,
      key,
      label,
      value,
    },
    '*',
  )
}

/** Parent → iframe: turn click-to-edit tools on/off. */
export function postCmsEditMode(enabled, targetWindow) {
  if (!targetWindow) return
  try {
    targetWindow.sessionStorage?.setItem(CMS_EDIT_STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    setCmsEditToolsPreference(enabled)
  }
  targetWindow.postMessage(
    {
      source: 'united-properties-cms',
      type: CMS_EDIT_MODE_MESSAGE,
      enabled: Boolean(enabled),
    },
    '*',
  )
}

export {sameOrigin}
