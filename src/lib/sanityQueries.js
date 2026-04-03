const PROPERTY_PROJECTION = `
    _id,
    title,
    slug,
    status,
    propertyType,
    price,
    currency,
    location,
    address,
    bedrooms,
    bathrooms,
    internalArea,
    plotSize,
    parkingSpaces,
    yearBuilt,
    featured,
    newDevelopment,
    mainImage,
    gallery,
    description,
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
  *[_type == "property"][0...5]{_id,title,slug,status}
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
