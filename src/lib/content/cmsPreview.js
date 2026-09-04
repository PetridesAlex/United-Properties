/** CMS click-to-edit preview bridge (iframe ↔ admin). */

export const CMS_PREVIEW_MESSAGE = 'up-cms-select'
export const CMS_PREVIEW_READY = 'up-cms-ready'
export const CMS_EDIT_MODE_MESSAGE = 'up-cms-edit-mode'
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

/**
 * Fallback click targets when a node isn't wrapped with data-cms attrs yet.
 * First matching closest selector wins — prefer tagged nodes via resolveCmsTargetFromNode.
 */
export const CMS_SELECTOR_TARGETS = [
  {page: 'home', section: 'hero', selector: '.hero-section'},
  {page: 'home', section: 'featured', selector: '#featured-properties'},
  {page: 'home', section: 'signature', selector: '.home-scroll-stack-section'},
  {page: 'home', section: 'services', selector: '[data-cms-page="home"][data-cms-section="services"]'},
  {page: 'home', section: 'editorial', selector: '[data-cms-page="home"][data-cms-section="editorial"]'},
  {page: 'home', section: 'team', selector: '[data-cms-page="home"][data-cms-section="team"]'},
  {page: 'home', section: 'testimonials', selector: '.home-testimonials'},
  {page: 'home', section: 'cta', selector: '.cta-section[data-cms-page="home"]'},
  {page: 'about', section: 'hero', selector: '[data-cms-page="about"][data-cms-section="hero"]'},
  {page: 'about', section: 'story', selector: '[data-cms-page="about"][data-cms-section="story"]'},
  {page: 'about', section: 'why', selector: '[data-cms-page="about"][data-cms-section="why"]'},
  {page: 'about', section: 'team', selector: '[data-cms-page="about"][data-cms-section="team"]'},
  {page: 'about', section: 'cta', selector: '.cta-section[data-cms-page="about"]'},
  {page: 'contact', section: 'hero', selector: '[data-cms-page="contact"][data-cms-section="hero"]'},
  {page: 'contact', section: 'intro', selector: '[data-cms-page="contact"][data-cms-section="intro"]'},
  {page: 'contact', section: 'methods', selector: '[data-cms-page="contact"][data-cms-section="methods"]'},
  {page: 'contact', section: 'office', selector: '[data-cms-page="contact"][data-cms-section="office"]'},
  {page: 'services', section: 'hero', selector: '[data-cms-page="services"][data-cms-section="hero"]'},
  {page: 'services', section: 'invest_body', selector: '[data-cms-page="services"][data-cms-section="invest_body"]'},
  {page: 'services', section: 'invest', selector: '[data-cms-page="services"][data-cms-section="invest"]'},
  {page: 'services', section: 'management', selector: '[data-cms-page="services"][data-cms-section="management"]'},
  {page: 'services', section: 'rent_property', selector: '[data-cms-page="services"][data-cms-section="rent_property"]'},
  {page: 'services', section: 'cta', selector: '.cta-section[data-cms-page="services"]'},
  {page: 'sell', section: 'hero', selector: '[data-cms-page="sell"][data-cms-section="hero"]'},
  {page: 'sell', section: 'problem', selector: '[data-cms-page="sell"][data-cms-section="problem"]'},
  {page: 'sell', section: 'process', selector: '[data-cms-page="sell"][data-cms-section="process"]'},
  {page: 'sell', section: 'why', selector: '[data-cms-page="sell"][data-cms-section="why"]'},
  {page: 'sell', section: 'proof', selector: '[data-cms-page="sell"][data-cms-section="proof"]'},
  {page: 'sell', section: 'compare', selector: '[data-cms-page="sell"][data-cms-section="compare"]'},
  {page: 'sell', section: 'cta', selector: '.cta-section[data-cms-page="sell"]'},
  {page: 'properties', section: 'hero_buy', selector: '[data-cms-page="properties"][data-cms-section="hero_buy"]'},
  {page: 'properties', section: 'hero_rent', selector: '[data-cms-page="properties"][data-cms-section="hero_rent"]'},
  {page: 'properties', section: 'hero_sold', selector: '[data-cms-page="properties"][data-cms-section="hero_sold"]'},
  {page: 'properties', section: 'hero_rented', selector: '[data-cms-page="properties"][data-cms-section="hero_rented"]'},
  {page: 'properties', section: 'hero_featured', selector: '[data-cms-page="properties"][data-cms-section="hero_featured"]'},
  {page: 'properties', section: 'hero_signature', selector: '[data-cms-page="properties"][data-cms-section="hero_signature"]'},
  {page: 'navbar', section: 'nav', selector: '.navbar'},
  {page: 'footer', section: 'brand', selector: '.footer'},
  {page: 'cookies', section: 'modal', selector: '.cookie-preferences__bar, .cookie-preferences'},
  {page: 'search', section: 'panel', selector: '.search-panel'},
]

export function resolveCmsTargetFromNode(node) {
  if (!node || !(node instanceof Element)) return null

  const marked = node.closest('[data-cms-page][data-cms-section]')
  if (marked) {
    return {
      page: marked.getAttribute('data-cms-page') || '',
      section: marked.getAttribute('data-cms-section') || '',
    }
  }

  for (const target of CMS_SELECTOR_TARGETS) {
    if (node.closest(target.selector)) {
      return {page: target.page, section: target.section}
    }
  }

  return null
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

export function postCmsSelect(page, section) {
  if (typeof window === 'undefined') return
  const payload = {
    source: 'united-properties-cms',
    type: CMS_PREVIEW_MESSAGE,
    page,
    section,
  }
  const target = window.parent && window.parent !== window ? window.parent : null
  if (!target) return
  target.postMessage(payload, '*')
}

export function postCmsReady() {
  if (typeof window === 'undefined') return
  const payload = {
    source: 'united-properties-cms',
    type: CMS_PREVIEW_READY,
  }
  const target = window.parent && window.parent !== window ? window.parent : null
  if (!target) return
  target.postMessage(payload, '*')
}

/** Parent → iframe: turn click-to-edit tools on/off. */
export function postCmsEditMode(enabled, targetWindow) {
  if (!targetWindow) return
  try {
    // Prefer writing into the iframe's storage when possible (same-origin).
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
