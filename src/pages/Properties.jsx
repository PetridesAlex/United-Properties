import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { matchesListingLocation } from '../lib/matchesListingLocation'
import './Properties.css'

const initialFilters = {
  type: '',
  status: '',
  featured: '',
  bedrooms: '',
  bathrooms: '',
  minPrice: '',
  maxPrice: '',
  keyword: '',
}

/** Hosts may serve `/rent` or `/rent/` — normalize so route rules always match. */
function normalizePathname(pathname) {
  if (!pathname) return '/'
  const trimmed = pathname.replace(/\/+$/, '') || '/'
  return trimmed
}

function getFiltersFromLocation(location) {
  const pathname = normalizePathname(location.pathname)
  const { search } = location
  const params = new URLSearchParams(search)
  const filters = {
    ...initialFilters,
    type: params.get('type') || '',
    status: params.get('status') || '',
    featured: params.get('featured') || '',
    keyword: params.get('keyword') || '',
  }

  if (pathname === '/buy') {
    filters.status = 'For Sale'
  } else if (pathname === '/rent') {
    filters.status = 'For Rent'
  } else if (pathname === '/featured-properties') {
    filters.status = 'For Sale'
    filters.featured = 'true'
  } else if (pathname === '/signature-listings') {
    filters.keyword = 'signature'
  }

  return filters
}

function getModeFromRoute(location) {
  const params = new URLSearchParams(location.search)
  const searchMode = params.get('mode') || ''
  const pathname = normalizePathname(location.pathname)

  if (pathname === '/rent') return 'rent'
  if (pathname === '/buy' || pathname === '/featured-properties') return 'buy'
  if (searchMode) return searchMode
  if (params.get('status') === 'For Rent') return 'rent'
  return 'buy'
}

function getDiscoveryIntro(mode) {
  if (mode === 'rent') {
    return {
      eyebrow: 'Limassol rentals',
      title: 'Homes & apartments to lease',
      description:
        'Long-term and seasonal lets across prime Limassol districts — curated by our team.',
    }
  }
  return {
    eyebrow: 'United Properties · Limassol',
    title: 'Browse listings',
    description:
      'Apartments, villas, and investment homes in Limassol and surrounding neighbourhoods we serve.',
  }
}

function getHeroContent(mode, status) {
  if (mode === 'rent' || status === 'For Rent') {
    return {
      modeClass: 'properties-hero--rent',
      eyebrow: 'Rent in Limassol',
      lead: 'Flexible luxury leasing on the coast and in the city.',
      title: 'Exclusive Rental Homes',
      description:
        'Browse premium apartments, villas, and furnished residences in Limassol — short and long-term.',
      pageTitle: 'Rent Properties | United Properties',
    }
  }

  return {
    modeClass: 'properties-hero--buy',
    eyebrow: 'Buy in Limassol',
    lead: 'Find your next address in Limassol.',
    title: 'Your New Home Awaits',
    description:
      'Explore curated residences in Limassol — from seafront apartments to family villas and investment opportunities.',
    pageTitle: 'Properties | United Properties',
  }
}

function Properties() {
  const routeLocation = useLocation()
  const { list: allProperties, loading: propertiesLoading, error: propertiesError } =
    useMergedProperties()
  const [filters, setFilters] = useState(() => getFiltersFromLocation(routeLocation))
  const [visibleCount, setVisibleCount] = useState(6)
  const mode = useMemo(() => getModeFromRoute(routeLocation), [routeLocation])
  const heroContent = useMemo(
    () => getHeroContent(mode, filters.status),
    [mode, filters.status],
  )
  const discoveryIntro = useMemo(() => getDiscoveryIntro(mode), [mode])

  useEffect(() => {
    setFilters(getFiltersFromLocation(routeLocation))
    setVisibleCount(6)
  }, [routeLocation])

  const filtered = useMemo(() => {
    const keyword = filters.keyword.toLowerCase()
    const result = allProperties.filter((property) => {
      const inLimassol = matchesListingLocation(property.location, 'Limassol')
      const matchesType = !filters.type || property.type === filters.type
      const matchesStatus = !filters.status || property.status === filters.status
      const matchesFeatured =
        !filters.featured || (filters.featured === 'true' ? Boolean(property.featured) : true)
      const matchesBeds = !filters.bedrooms || property.bedrooms >= Number(filters.bedrooms)
      const matchesBaths = !filters.bathrooms || property.bathrooms >= Number(filters.bathrooms)
      const matchesMin = !filters.minPrice || property.price >= Number(filters.minPrice)
      const matchesMax = !filters.maxPrice || property.price <= Number(filters.maxPrice)
      const matchesKeyword =
        !keyword ||
        [property.title, property.location, property.description, property.type, property.referenceId]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(keyword)

      return (
        inLimassol &&
        matchesType &&
        matchesStatus &&
        matchesFeatured &&
        matchesBeds &&
        matchesBaths &&
        matchesMin &&
        matchesMax &&
        matchesKeyword
      )
    })

    return result
  }, [filters, allProperties])

  const visibleProperties = filtered.slice(0, visibleCount)

  return (
    <>
      <Helmet>
        <title>{heroContent.pageTitle}</title>
      </Helmet>

      <section className={`page-hero properties-hero ${heroContent.modeClass}`.trim()}>
        <div className="container">
          <p className="properties-hero__eyebrow">{heroContent.eyebrow}</p>
          <h1>{heroContent.title}</h1>
          <p className="properties-hero__description">{heroContent.description}</p>
          <a href="#properties-discovery" className="btn btn-gold properties-hero__jump">
            Jump to Listings
          </a>
        </div>
      </section>

      <section className="section section--light" id="properties-discovery">
        <div className="container">
          <header className="properties-discovery__header properties-discovery__header--limassol">
            <p className="properties-discovery__eyebrow">{discoveryIntro.eyebrow}</p>
            <h2>{discoveryIntro.title}</h2>
            <p className="properties-discovery__description">{discoveryIntro.description}</p>
          </header>

          <div className="properties-results-zone">
            {propertiesError && !propertiesLoading ? (
              <div className="properties__fetch-error card-luxury" role="alert">
                <h3>Could not load live listings</h3>
                <p>
                  Check your connection, then refresh the page. If the problem continues, the Sanity API may be
                  temporarily unavailable.
                </p>
                <p className="properties__fetch-error-detail">{propertiesError}</p>
              </div>
            ) : null}

            <p className="properties__result-count">
              {propertiesLoading ? 'Loading listings…' : `${filtered.length} matching properties`}
            </p>

            {!propertiesLoading && visibleProperties.length ? (
              <>
                <div className="grid-3">
                  {visibleProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} variant="cover" />
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div className="properties__loadmore">
                    <button className="btn btn-outline-dark" onClick={() => setVisibleCount((count) => count + 3)}>
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : null}

            {!propertiesLoading && !visibleProperties.length ? (
              <div className="properties__empty card-luxury">
                <h3>{propertiesError ? 'No cached listings to show' : 'No properties match your filters'}</h3>
                <p>
                  {propertiesError
                    ? 'Fix the connection issue above, or adjust filters once listings load.'
                    : 'Adjust your criteria to discover more listings.'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}

export default Properties
