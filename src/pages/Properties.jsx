import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { matchesListingLocation } from '../lib/matchesListingLocation'
import './Properties.css'

const initialFilters = {
  location: '',
  type: '',
  status: '',
  featured: '',
  bedrooms: '',
  bathrooms: '',
  minPrice: '',
  maxPrice: '',
  keyword: '',
}

const discoveryLocations = [
  {
    name: 'Limassol',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Nicosia',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Paphos',
    image:
      'https://images.unsplash.com/photo-1613977257360-707ba9348227?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Larnaca',
    image:
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Protaras',
    image:
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80',
  },
]

const buyRegions = ['Limassol', 'Nicosia', 'Paphos', 'Larnaca', 'Protaras']
const citySlugToName = {
  limassol: 'Limassol',
  paphos: 'Paphos',
  nicosia: 'Nicosia',
  larnaca: 'Larnaca',
  protaras: 'Protaras',
  'ayia-napa': 'Ayia Napa',
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
    location: params.get('location') || '',
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

  const citySlug = pathname.startsWith('/properties/')
    ? pathname.replace('/properties/', '').trim().toLowerCase()
    : ''
  if (citySlug && citySlugToName[citySlug]) {
    filters.location = citySlugToName[citySlug]
  }

  return filters
}

function getModeFromRoute(location) {
  const params = new URLSearchParams(location.search)
  const searchMode = params.get('mode') || ''
  const pathname = normalizePathname(location.pathname)

  if (pathname === '/rent') return 'rent'
  if (pathname === '/new-developments') return 'new-development'
  if (pathname === '/buy' || pathname === '/featured-properties') return 'buy'
  if (searchMode) return searchMode
  if (params.get('status') === 'For Rent') return 'rent'
  return 'buy'
}

function getHeroContent(mode, status) {
  if (mode === 'rent' || status === 'For Rent') {
    return {
      modeClass: 'properties-hero--rent',
      eyebrow: 'Rent',
      lead: 'Flexible luxury leasing in Cyprus prime districts.',
      title: 'Exclusive Rental Homes',
      description:
        'Browse premium apartments, villas, and furnished residences available for short and long-term living.',
      pageTitle: 'Rent Properties | United Properties',
    }
  }

  if (mode === 'new-development') {
    return {
      modeClass: 'properties-hero--development',
      eyebrow: 'New Development',
      lead: 'Future-ready projects designed for modern Mediterranean living.',
      title: 'Cyprus New Developments',
      description:
        'Explore off-plan and newly launched residences with strong design vision, premium amenities, and long-term value.',
      pageTitle: 'New Developments | United Properties',
    }
  }

  return {
    modeClass: 'properties-hero--buy',
    eyebrow: 'Buy in Cyprus',
    lead: 'Find your next address in Cyprus.',
    title: 'Your New Home Awaits',
    description:
      'Explore curated residences by location and discover properties that match your lifestyle and investment goals.',
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
  /** Buy-style region grid: buy, featured, signature, default browse — not rent or new-development. */
  const showBuyRegions = mode === 'buy'
  const showRentDiscovery = mode === 'rent'
  const showNewDevelopmentDiscovery = mode === 'new-development'
  const showLocationImageCards = mode === 'rent' || mode === 'new-development'

  useEffect(() => {
    setFilters(getFiltersFromLocation(routeLocation))
    setVisibleCount(6)
  }, [routeLocation])

  const filtered = useMemo(() => {
    const keyword = filters.keyword.toLowerCase()
    const result = allProperties.filter((property) => {
      const matchesLocation =
        !filters.location || matchesListingLocation(property.location, filters.location)
      const matchesType = !filters.type || property.type === filters.type
      const matchesStatus = !filters.status || property.status === filters.status
      const matchesFeatured =
        !filters.featured || (filters.featured === 'true' ? Boolean(property.featured) : true)
      const matchesNewDevelopment =
        mode !== 'new-development' || property.isNewDevelopment === true
      const matchesBeds = !filters.bedrooms || property.bedrooms >= Number(filters.bedrooms)
      const matchesBaths = !filters.bathrooms || property.bathrooms >= Number(filters.bathrooms)
      const matchesMin = !filters.minPrice || property.price >= Number(filters.minPrice)
      const matchesMax = !filters.maxPrice || property.price <= Number(filters.maxPrice)
      const matchesKeyword =
        !keyword ||
        [property.title, property.location, property.description, property.type]
          .join(' ')
          .toLowerCase()
          .includes(keyword)

      return (
        matchesLocation &&
        matchesType &&
        matchesStatus &&
        matchesFeatured &&
        matchesNewDevelopment &&
        matchesBeds &&
        matchesBaths &&
        matchesMin &&
        matchesMax &&
        matchesKeyword
      )
    })

    return result
  }, [filters, mode, allProperties])

  const visibleProperties = filtered.slice(0, visibleCount)
  const onLocationCardClick = (selectedLocation) => {
    setFilters((current) => ({
      ...current,
      location: current.location === selectedLocation ? '' : selectedLocation,
    }))
    setVisibleCount(6)
  }

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
          <header className="properties-discovery__header">
            {showBuyRegions ? (
              <div className="properties-regions">
                <div className="properties-regions__intro">
                  <h2>Our Regions</h2>
                  <p>Discover the home you&apos;ve been waiting for.</p>
                </div>
                <div className="properties-regions__grid" role="tablist" aria-label="Choose location">
                  {buyRegions.map((region) => (
                    <button
                      key={region}
                      type="button"
                      role="tab"
                      aria-selected={filters.location === region}
                      className={`properties-region-btn ${filters.location === region ? 'is-active' : ''}`}
                      onClick={() => onLocationCardClick(region)}
                    >
                      <span>{region}</span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
            ) : showRentDiscovery ? (
              <>
                <p className="properties-discovery__eyebrow">Locations</p>
                <h2>Rentals by area</h2>
                <p className="properties-discovery__description">
                  Choose a region to filter long-term and seasonal rentals across Cyprus.
                </p>
              </>
            ) : showNewDevelopmentDiscovery ? (
              <>
                <p className="properties-discovery__eyebrow">The Boldest</p>
                <h2>New Developments</h2>
                <p className="properties-discovery__description">
                  Explore transformative new buildings that redefine modern luxury living and help
                  you Move Forward.
                </p>
              </>
            ) : null}
          </header>

          {showLocationImageCards && (
            <div className="properties-discovery__locations">
              {discoveryLocations.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`properties-location-card ${
                    filters.location === item.name ? 'is-active' : ''
                  }`.trim()}
                  onClick={() => onLocationCardClick(item.name)}
                  style={{ backgroundImage: `url(${item.image})` }}
                  aria-label={`Show ${item.name} properties`}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}

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
