/**
 * Resize/optimize public image URLs for faster listing previews.
 * Supabase Storage → /render/image/public/… (falls back to original if transforms unavailable).
 * Unsplash → width/quality query params.
 */

/** @typedef {{ width?: number, height?: number, quality?: number, resize?: 'cover' | 'contain' | 'fill' }} ImageTransform */

/** @type {Record<string, ImageTransform>} */
export const IMAGE_PRESETS = {
  thumb: {width: 320, quality: 68},
  card: {width: 720, quality: 72},
  featuredCard: {width: 640, quality: 72},
  featuredExpanded: {width: 1400, quality: 78},
  mosaicHero: {width: 1400, quality: 75},
  mosaicTile: {width: 720, quality: 72},
  lightbox: {width: 1920, quality: 82},
  lightboxThumb: {width: 220, quality: 65},
  signature: {width: 1200, quality: 75},
}

const SUPABASE_OBJECT_RE = /^(https?:\/\/[^/]+)\/storage\/v1\/object\/public\/(.+)$/i
const SUPABASE_RENDER_RE = /^(https?:\/\/[^/]+)\/storage\/v1\/render\/image\/public\/(.+?)(?:\?.*)?$/i
const TRANSFORM_FLAG_KEY = 'up-img-transforms'

/** @type {boolean | null} null = unknown / try transforms */
let transformsEnabled = readStoredTransformFlag()

function readStoredTransformFlag() {
  try {
    const value = sessionStorage.getItem(TRANSFORM_FLAG_KEY)
    if (value === '0') return false
    if (value === '1') return true
  } catch {
    // ignore
  }
  return null
}

export function areImageTransformsEnabled() {
  return transformsEnabled !== false
}

export function disableImageTransforms() {
  if (transformsEnabled === false) return
  transformsEnabled = false
  try {
    sessionStorage.setItem(TRANSFORM_FLAG_KEY, '0')
  } catch {
    // ignore
  }
}

export function enableImageTransforms() {
  transformsEnabled = true
  try {
    sessionStorage.setItem(TRANSFORM_FLAG_KEY, '1')
  } catch {
    // ignore
  }
}

/**
 * @param {string | null | undefined} url
 * @param {ImageTransform | keyof typeof IMAGE_PRESETS} [opts]
 */
export function optimizeImageUrl(url, opts = 'card') {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (transformsEnabled === false) return trimmed

  const transform = typeof opts === 'string' ? IMAGE_PRESETS[opts] || IMAGE_PRESETS.card : opts || {}
  const width = clampInt(transform.width, 1, 2500)
  const height = clampInt(transform.height, 1, 2500)
  const quality = clampInt(transform.quality, 20, 100) ?? 75
  const resize = transform.resize || 'cover'

  const supabase = toSupabaseRenderUrl(trimmed, {width, height, quality, resize})
  if (supabase) return supabase

  const unsplash = toUnsplashUrl(trimmed, {width, quality})
  if (unsplash) return unsplash

  return trimmed
}

/**
 * @param {string | null | undefined} url
 * @param {ImageTransform | keyof typeof IMAGE_PRESETS} [opts]
 * @param {number[]} [densities]
 */
export function optimizeImageSrcSet(url, opts = 'card', densities = [1, 2]) {
  if (!url || transformsEnabled === false) return undefined
  const transform = typeof opts === 'string' ? IMAGE_PRESETS[opts] || IMAGE_PRESETS.card : opts || {}
  const baseWidth = clampInt(transform.width, 1, 2500)
  if (!baseWidth) return undefined

  const parts = []
  for (const density of densities) {
    const width = Math.min(2500, Math.round(baseWidth * density))
    const optimized = optimizeImageUrl(url, {...transform, width})
    if (optimized && optimized !== url) parts.push(`${optimized} ${width}w`)
  }
  return parts.length ? parts.join(', ') : undefined
}

export function isSupabasePublicImageUrl(url) {
  return Boolean(url && (SUPABASE_OBJECT_RE.test(url) || SUPABASE_RENDER_RE.test(url)))
}

/**
 * @param {string} url
 * @param {ImageTransform} transform
 */
function toSupabaseRenderUrl(url, transform) {
  let origin = ''
  let objectPath = ''

  const objectMatch = url.match(SUPABASE_OBJECT_RE)
  if (objectMatch) {
    origin = objectMatch[1]
    objectPath = objectMatch[2]
  } else {
    const renderMatch = url.match(SUPABASE_RENDER_RE)
    if (!renderMatch) return null
    origin = renderMatch[1]
    objectPath = renderMatch[2]
  }

  const params = new URLSearchParams()
  if (transform.width) params.set('width', String(transform.width))
  if (transform.height) params.set('height', String(transform.height))
  if (transform.quality) params.set('quality', String(transform.quality))
  if (transform.resize) params.set('resize', transform.resize)

  const query = params.toString()
  return `${origin}/storage/v1/render/image/public/${objectPath}${query ? `?${query}` : ''}`
}

/**
 * @param {string} url
 * @param {{ width?: number, quality?: number }} transform
 */
function toUnsplashUrl(url, transform) {
  if (!/images\.unsplash\.com/i.test(url)) return null
  try {
    const parsed = new URL(url)
    if (transform.width) {
      parsed.searchParams.set('w', String(transform.width))
      parsed.searchParams.set('fit', 'crop')
    }
    if (transform.quality) parsed.searchParams.set('q', String(transform.quality))
    parsed.searchParams.set('auto', 'format')
    return parsed.toString()
  } catch {
    return null
  }
}

/** @param {unknown} value @param {number} min @param {number} max */
function clampInt(value, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return undefined
  return Math.min(max, Math.max(min, Math.round(n)))
}
