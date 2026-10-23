/**
 * Resize public image URLs for listing previews.
 * Supabase Storage originals are multi‑megabyte and project image transforms are disabled,
 * so those URLs go through `/api/image`, which returns a cached JPEG at the requested width.
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

/**
 * @param {string | null | undefined} url
 * @param {ImageTransform | keyof typeof IMAGE_PRESETS} [opts]
 */
export function optimizeImageUrl(url, opts = 'card') {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  const transform = typeof opts === 'string' ? IMAGE_PRESETS[opts] || IMAGE_PRESETS.card : opts || {}
  const width = clampInt(transform.width, 1, 2000)
  const quality = clampInt(transform.quality, 20, 100) ?? 75

  const supabase = toSizedStorageUrl(trimmed, {width, quality})
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
  if (!url) return undefined
  const transform = typeof opts === 'string' ? IMAGE_PRESETS[opts] || IMAGE_PRESETS.card : opts || {}
  const baseWidth = clampInt(transform.width, 1, 2500)
  if (!baseWidth) return undefined

  const parts = []
  for (const density of densities) {
    const width = Math.min(2000, Math.round(baseWidth * density))
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
 * @param {{ width?: number, quality?: number }} transform
 */
function toSizedStorageUrl(url, transform) {
  const objectMatch = url.match(SUPABASE_OBJECT_RE)
  const renderMatch = objectMatch ? null : url.match(SUPABASE_RENDER_RE)
  if (!objectMatch && !renderMatch) return null

  const origin = (objectMatch || renderMatch)[1]
  const objectPath = (objectMatch || renderMatch)[2]
  const original = `${origin}/storage/v1/object/public/${objectPath}`
  const params = new URLSearchParams()
  params.set('url', original)
  if (transform.width) params.set('w', String(transform.width))
  if (transform.quality) params.set('q', String(transform.quality))
  return `/api/image?${params.toString()}`
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
