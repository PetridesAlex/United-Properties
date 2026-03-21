export const ALL_PROPERTIES_QUERY = `
  *[_type == "property"] | order(featured desc, _createdAt desc) {
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
    mainImage,
    gallery,
    description,
    amenities,
    seoTitle,
    seoDescription
  }
`
