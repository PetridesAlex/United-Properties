import type {BazarakiValidation, Property} from '../../../types/cms'
import {isActiveStatus} from '../../../types/cms'

/**
 * Readiness checks for a future Bazaraki XML feed.
 * Does not implement XML mapping — only validates likely required fields.
 */
export function validatePropertyForBazaraki(
  property: Partial<Property> & {property_images?: {image_url: string}[]},
): BazarakiValidation {
  const missingFields: string[] = []
  const errors: string[] = []
  const warnings: string[] = []

  if (!property.title?.trim()) missingFields.push('Title')
  if (!property.property_type?.trim()) missingFields.push('Property type')
  if (property.price == null || Number(property.price) <= 0) missingFields.push('Price')
  if (!property.city?.trim()) missingFields.push('City')
  if (!property.description?.trim() && !property.short_description?.trim()) {
    missingFields.push('Description')
  }
  if (!property.bedrooms && property.bedrooms !== 0) missingFields.push('Bedrooms')
  if (!property.internal_area && !property.covered_area) missingFields.push('Area (sqm)')

  const images = property.property_images ?? []
  if (!images.length) missingFields.push('At least one image')

  if (!property.published) {
    errors.push('Property must be published on the website before Bazaraki export.')
  }
  if (property.status && !isActiveStatus(property.status)) {
    errors.push('Sold and rented properties are excluded from the active Bazaraki feed.')
  }
  if (property.archived_at) {
    errors.push('Archived properties cannot be published to Bazaraki.')
  }
  if (!property.publish_to_bazaraki) {
    warnings.push('Publish to Bazaraki is turned off for this property.')
  }
  if (!property.address?.trim()) warnings.push('Address is recommended for Bazaraki.')
  if (property.latitude == null || property.longitude == null) {
    warnings.push('Coordinates are recommended for map placement.')
  }

  const ready =
    missingFields.length === 0 &&
    errors.length === 0 &&
    Boolean(property.publish_to_bazaraki) &&
    Boolean(property.published) &&
    Boolean(property.status && isActiveStatus(property.status)) &&
    !property.archived_at

  return {ready, missingFields, errors, warnings}
}
