import type {Property, PropertyStatus, PublicPropertyCard} from '../../types/cms'
import {PROPERTY_STATUS_LABELS} from '../../types/cms'

const STATUS_TO_PUBLIC: Record<PropertyStatus, PublicPropertyCard['status']> = {
  for_sale: 'For Sale',
  for_rent: 'For Rent',
  sold: 'Sold',
  rented: 'Rented',
}

export function mapPropertyToPublicCard(property: Property): PublicPropertyCard {
  const images = [...(property.property_images ?? [])].sort(
    (a, b) => a.position - b.position,
  )
  const featuredImage =
    images.find((img) => img.is_featured)?.image_url ?? images[0]?.image_url ?? ''
  const gallery = images.map((img) => img.image_url).filter(Boolean)
  const location =
    [property.area, property.city].filter(Boolean).join(', ') ||
    property.city ||
    property.district ||
    ''

  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    location,
    price: Number(property.price ?? 0),
    type: property.property_type || 'Property',
    status: STATUS_TO_PUBLIC[property.status],
    bedrooms: property.bedrooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    sqm: Number(property.internal_area ?? property.covered_area ?? 0),
    description: property.description || property.short_description || '',
    features: property.features ?? [],
    image: featuredImage,
    gallery: gallery.length ? gallery : featuredImage ? [featuredImage] : [],
    featured: Boolean(property.featured),
    yearBuilt: property.year_built ?? undefined,
    parking: property.parking_spaces ?? undefined,
    plotSize: property.plot_size != null ? Number(property.plot_size) : undefined,
    address: property.address ?? undefined,
    referenceId: property.reference_number,
    seoTitle: property.seo_title ?? undefined,
    seoDescription: property.seo_description ?? undefined,
  }
}

export function publicStatusToDb(
  status: string | undefined,
): PropertyStatus | undefined {
  if (!status) return undefined
  const entry = (Object.entries(PROPERTY_STATUS_LABELS) as [PropertyStatus, string][]).find(
    ([, label]) => label === status,
  )
  return entry?.[0]
}

export function statusLabel(status: PropertyStatus): string {
  return PROPERTY_STATUS_LABELS[status]
}

export function completedFromActive(status: PropertyStatus): PropertyStatus | null {
  if (status === 'for_sale') return 'sold'
  if (status === 'for_rent') return 'rented'
  return null
}

export function revertCompleted(status: PropertyStatus): PropertyStatus | null {
  if (status === 'sold') return 'for_sale'
  if (status === 'rented') return 'for_rent'
  return null
}
