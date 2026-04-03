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
