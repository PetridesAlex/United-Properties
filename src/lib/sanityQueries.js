const PROPERTY_PROJECTION = `
    _id,
    _updatedAt,
    title,
    slug,
    status,
    purpose,
    listingStatus,
    referenceId,
    propertyType,
    price,
    currency,
    location,
    address,
    "city": city->{name, "slug": slug.current},
    "agent": agent->{_id, name, "slug": slug.current, email, phone},
    latitude,
    longitude,
    bedrooms,
    bathrooms,
    internalArea,
    plotSize,
    parkingSpaces,
    yearBuilt,
    featured,
    signature,
    mainImage,
    galleryLeadImage,
    gallery,
    floorPlanImage,
    brochureFile{
      asset->{
        url,
        originalFilename
      }
    },
    description,
    legacyDescriptionPlain,
    amenities,
    seoTitle,
    seoDescription
`

export const ALL_PROPERTIES_QUERY = `
  *[_type == "property"] | order(featured desc, _createdAt desc) {
    ${PROPERTY_PROJECTION}
  }
`

/**
 * Minimal GROQ for connectivity debugging. `status` is included so /rent (filter: For Rent) still
 * matches; with only {_id,title,slug}, mapSanityProperty defaults missing status to For Sale.
 * Enable with VITE_SANITY_MINIMAL_QUERY=true in .env
 */
export const MINIMAL_PROPERTIES_QUERY = `
  *[_type == "property"][0...5]{_id,title,slug,status,purpose,listingStatus}
`

export function getActivePropertiesQuery() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SANITY_MINIMAL_QUERY === 'true') {
    return MINIMAL_PROPERTIES_QUERY
  }
  return ALL_PROPERTIES_QUERY
}

export function getActiveQueryLabel() {
  return import.meta.env?.VITE_SANITY_MINIMAL_QUERY === 'true' ? 'minimal[0...5]' : 'full'
}
