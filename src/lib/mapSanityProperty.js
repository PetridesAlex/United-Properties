import { urlForImage } from './sanityClient'

export const STATUS_LABELS = {
  'for-sale': 'For Sale',
  'for-rent': 'For Rent',
  sold: 'Sold',
  reserved: 'Reserved',
}

export function toNumber(value, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function formatPropertyType(value) {
  if (!value || typeof value !== 'string') return 'Property'
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')
}

function hasImageAsset(image) {
  return Boolean(image?.asset?._ref || image?.asset?._id)
}

/** Incomplete CMS images (e.g. empty gallery slot) must not break the whole listing fetch. */
function buildImageUrl(image, width, height) {
  if (!hasImageAsset(image)) return null
  try {
    const builder = urlForImage(image)
    if (!builder) return null
    return builder.width(width).height(height).fit('crop').url()
  } catch {
    return null
  }
}

/** Studio values are `for-rent`; free text or imports may use spaces ("for rent"). */
function normalizeStatusKey(raw) {
  if (typeof raw !== 'string') return ''
  return raw.trim().toLowerCase().replace(/\s+/g, '-')
}

function mapSanityStatus(raw) {
  const key = normalizeStatusKey(raw)
  return STATUS_LABELS[key] || 'For Sale'
}

export function mapSanityProperty(item, index) {
  const mainImage = buildImageUrl(item.mainImage, 1600, 1060)
  const gallery = Array.isArray(item.gallery)
    ? item.gallery
        .map((image) => buildImageUrl(image, 1600, 1060))
        .filter(Boolean)
    : []

  const amenities = Array.isArray(item.amenities)
    ? item.amenities.map((a) => (typeof a === 'string' ? a.trim() : '')).filter(Boolean)
    : []

  return {
    id: item._id || `sanity-property-${index}`,
    slug: item.slug?.current || `property-${index}`,
    title: String(item.title ?? '').trim() || 'Untitled Property',
    location: item.location || 'Cyprus',
    price: toNumber(item.price),
    type: formatPropertyType(item.propertyType),
    status: mapSanityStatus(item.status),
    bedrooms: toNumber(item.bedrooms),
    bathrooms: toNumber(item.bathrooms),
    sqm: toNumber(item.internalArea),
    description: item.description || 'Discover this premium listing in Cyprus.',
    features: amenities,
    image:
      mainImage ||
      'https://images.unsplash.com/photo-1613977257360-707ba9348227?auto=format&fit=crop&w=1600&q=80',
    gallery: gallery.length ? gallery : mainImage ? [mainImage] : [],
    featured: Boolean(item.featured),
    isNewDevelopment: Boolean(item.newDevelopment),
    isSignature: Boolean(item.signature),
    category: formatPropertyType(item.propertyType),
    yearBuilt: toNumber(item.yearBuilt),
    parking: toNumber(item.parkingSpaces),
    plotSize: toNumber(item.plotSize),
    agentId: null,
    source: 'sanity',
  }
}

/**
 * Sanity entries win on slug collision; static items get default flags.
 */
export function mergeSanityAndStaticProperties(staticItems, sanityMapped) {
  const bySlug = new Map()
  for (const p of staticItems) {
    bySlug.set(p.slug, {
      ...p,
      isNewDevelopment: Boolean(p.isNewDevelopment),
      source: 'static',
    })
  }
  for (const p of sanityMapped) {
    bySlug.set(p.slug, p)
  }
  return Array.from(bySlug.values())
}
