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

/** Portable-text blocks → plain string for listing cards (CMS v2). */
export function portableTextToPlainText(blocks) {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter((b) => b && b._type === 'block' && Array.isArray(b.children))
    .map((b) => b.children.map((c) => (c && typeof c.text === 'string' ? c.text : '')).join(''))
    .join('\n\n')
    .trim()
}

function resolveDescription(item) {
  if (typeof item.description === 'string' && item.description.trim()) {
    return item.description.trim()
  }
  const fromBlocks = portableTextToPlainText(item.description)
  if (fromBlocks) return fromBlocks
  if (typeof item.legacyDescriptionPlain === 'string' && item.legacyDescriptionPlain.trim()) {
    return item.legacyDescriptionPlain.trim()
  }
  return 'Discover this premium listing in Cyprus.'
}

/**
 * Maps new CMS fields (`purpose`, `listingStatus`) to the same display strings the site already uses
 * (`For Sale`, `For Rent`, `Sold`, …). Falls back to legacy `status` when needed.
 */
function mapDisplayStatus(item) {
  const purpose = item.purpose
  const listingStatus = item.listingStatus
  const legacy = item.status

  if (purpose === 'sale' || purpose === 'rent') {
    if (listingStatus === 'sold') return 'Sold'
    if (listingStatus === 'rented') return 'Rented'
    if (listingStatus === 'reserved') return 'Reserved'
    if (listingStatus === 'available') {
      return purpose === 'rent' ? 'For Rent' : 'For Sale'
    }
  }

  return mapSanityStatus(legacy)
}

function resolveLocationLabel(item) {
  const cityName = item.city?.name
  if (typeof cityName === 'string' && cityName.trim()) return cityName.trim()
  return item.location || 'Cyprus'
}

export function mapSanityProperty(item, index) {
  const mainImage = buildImageUrl(item.mainImage, 1600, 1060)
  const floorPlanUrl = buildImageUrl(item.floorPlanImage, 1600, 1060)
  const brochureAsset = item.brochureFile?.asset
  const brochureUrl =
    typeof brochureAsset?.url === 'string' && brochureAsset.url.length > 0 ? brochureAsset.url : null
  const brochureFilename =
    typeof brochureAsset?.originalFilename === 'string' ? brochureAsset.originalFilename : null

  const galleryUrls = Array.isArray(item.gallery)
    ? item.gallery.map((image) => buildImageUrl(image, 1600, 1060)).filter(Boolean)
    : []

  const leadUrl = buildImageUrl(item.galleryLeadImage, 1600, 1060)
  let gallery = galleryUrls
  if (leadUrl) {
    const rest = galleryUrls.filter((u) => u !== leadUrl)
    gallery = [leadUrl, ...rest]
  }

  const amenities = Array.isArray(item.amenities)
    ? item.amenities.map((a) => (typeof a === 'string' ? a.trim() : '')).filter(Boolean)
    : []

  return {
    id: item._id || `sanity-property-${index}`,
    slug: item.slug?.current || `property-${index}`,
    title: String(item.title ?? '').trim() || 'Untitled Property',
    location: resolveLocationLabel(item),
    price: toNumber(item.price),
    type: formatPropertyType(item.propertyType),
    status: mapDisplayStatus(item),
    purpose: item.purpose || null,
    listingStatus: item.listingStatus || null,
    referenceId: typeof item.referenceId === 'string' ? item.referenceId : null,
    bedrooms: toNumber(item.bedrooms),
    bathrooms: toNumber(item.bathrooms),
    sqm: toNumber(item.internalArea),
    description: resolveDescription(item),
    features: amenities,
    image:
      mainImage ||
      'https://images.unsplash.com/photo-1613977257360-707ba9348227?auto=format&fit=crop&w=1600&q=80',
    gallery: gallery.length ? gallery : mainImage ? [mainImage] : [],
    floorPlanUrl: floorPlanUrl || null,
    brochureUrl,
    brochureFilename,
    featured: Boolean(item.featured),
    isSignature: Boolean(item.signature),
    category: formatPropertyType(item.propertyType),
    yearBuilt: toNumber(item.yearBuilt),
    parking: toNumber(item.parkingSpaces),
    plotSize: toNumber(item.plotSize),
    agentId: item.agent?._id || null,
    agentName: typeof item.agent?.name === 'string' ? item.agent.name : null,
    latitude: typeof item.latitude === 'number' ? item.latitude : null,
    longitude: typeof item.longitude === 'number' ? item.longitude : null,
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
      source: 'static',
    })
  }
  for (const p of sanityMapped) {
    bySlug.set(p.slug, p)
  }
  return Array.from(bySlug.values())
}
