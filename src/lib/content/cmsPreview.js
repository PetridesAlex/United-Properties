/** CMS click-to-edit preview bridge (iframe ↔ admin). */

export const CMS_PREVIEW_MESSAGE = 'up-cms-select'
export const CMS_PREVIEW_READY = 'up-cms-ready'
export const CMS_EDIT_MODE_MESSAGE = 'up-cms-edit-mode'
export const CMS_PREVIEW_QUERY = 'cmsPreview'
export const CMS_EDIT_QUERY = 'cmsEdit'
export const CMS_EDIT_STORAGE_KEY = 'up.cmsEditTools'

export function isCmsPreviewMode() {
  if (typeof window === 'undefined') return false
  try {
    const params = new URLSearchParams(window.location.search)
    return params.has(CMS_PREVIEW_QUERY)
  } catch {
    return false
  }
}

export function isCmsEditMode() {
  if (typeof window === 'undefined') return false
  try {
    if (sessionStorage.getItem(CMS_EDIT_STORAGE_KEY) === '1') return true
    const params = new URLSearchParams(window.location.search)
    return params.get(CMS_EDIT_QUERY) === '1'
  } catch {
    return false
  }
}

export function setCmsEditToolsPreference(enabled) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CMS_EDIT_STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    // ignore
  }
}

export function cmsRegionProps(page, section) {
  return {
    'data-cms-page': page,
    'data-cms-section': section,
  }
}

/**
 * Fallback click targets when a node isn't wrapped in CmsRegion yet.
 * First matching closest selector wins.
 */
export const CMS_SELECTOR_TARGETS = [
  {page: 'home', section: 'hero', selector: '.hero-section'},
  {page: 'home', section: 'featured', selector: '#featured-properties'},
  {page: 'home', section: 'signature', selector: '.home-scroll-stack-section'},
  {page: 'home', section: 'services', selector: '[data-cms-section="services"]'},
  {page: 'home', section: 'editorial', selector: '[data-cms-section="editorial"]'},
  {page: 'home', section: 'team', selector: '[data-cms-section="team"]'},
  {page: 'home', section: 'testimonials', selector: '.home-testimonials'},
  {page: 'home', section: 'cta', selector: '.cta-section'},
  {page: 'navbar', section: 'nav', selector: '.navbar'},
  {page: 'footer', section: 'brand', selector: '.footer'},
  {page: 'cookies', section: 'modal', selector: '.cookie-preferences__bar, .cookie-preferences'},
  {page: 'search', section: 'panel', selector: '.search-panel'},
  {page: 'about', section: 'hero', selector: '.about-hero, .page-hero'},
  {page: 'contact', section: 'hero', selector: '.contact-hero, .page-hero'},
  {page: 'services', section: 'hero', selector: '.services-hero, .page-hero'},
  {page: 'sell', section: 'hero', selector: '.sell-hero, .page-hero'},
  {page: 'properties', section: 'hero', selector: '.properties-hero, .page-hero'},
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
    // Treat localhost / 127.0.0.1 as equivalent during local preview.
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

/** Parent → iframe: turn click-to-edit tools on/off without reloading the preview. */
export function postCmsEditMode(enabled, targetWindow) {
  if (!targetWindow) return
  setCmsEditToolsPreference(enabled)
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
