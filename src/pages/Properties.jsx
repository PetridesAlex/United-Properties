import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { useSiteContent } from '../hooks/useSiteContent'
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
  } else if (pathname === '/sold') {
    filters.status = 'Sold'
  } else if (pathname === '/rented') {
    filters.status = 'Rented'
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
  if (pathname === '/sold') return 'sold'
  if (pathname === '/rented') return 'rented'
  if (pathname === '/featured-properties') return 'featured'
  if (pathname === '/signature-listings') return 'signature'
  if (pathname === '/buy') return 'buy'
  if (searchMode) return searchMode
  if (params.get('status') === 'For Rent') return 'rent'
  return 'buy'
}

function getDiscoveryIntro(mode, get) {
  if (mode === 'rent') {
    return {
      eyebrow: get('properties', 'discovery_rent', 'eyebrow', 'Limassol rentals'),
      title: get('properties', 'discovery_rent', 'title', 'Homes & apartments to lease'),
      description: get(
        'properties',
        'discovery_rent',
        'description',
        'Long-term and seasonal lets across prime Limassol districts — curated by our team.',
      ),
    }
  }
  if (mode === 'sold') {
    return {
      eyebrow: get('properties', 'discovery_sold', 'eyebrow', 'Completed sales'),
      title: get('properties', 'discovery_sold', 'title', 'Recently sold properties'),
      description: get(
        'properties',
        'discovery_sold',
        'description',
        'A selection of homes successfully placed by United Properties.',
      ),
    }
  }
  if (mode === 'rented') {
    return {
      eyebrow: get('properties', 'discovery_rented', 'eyebrow', 'Let by United Properties'),
      title: get('properties', 'discovery_rented', 'title', 'Recently rented properties'),
      description: get(
        'properties',
        'discovery_rented',
        'description',
        'Homes and apartments successfully leased through our team.',
      ),
    }
  }
  if (mode === 'featured') {
    return {
      eyebrow: get('properties', 'discovery_featured', 'eyebrow', 'United Properties'),
      title: get('properties', 'discovery_featured', 'title', 'Featured homes'),
      description: get(
        'properties',
        'discovery_featured',
        'description',
        'Hand-picked listings our advisors are highlighting this season.',
      ),
    }
  }
  if (mode === 'signature') {
    return {
      eyebrow: get('properties', 'discovery_signature', 'eyebrow', 'Signature Collection'),
      title: get('properties', 'discovery_signature', 'title', 'Exclusive addresses'),
      description: get(
        'properties',
        'discovery_signature',
        'description',
        'Trophy homes and standout residences from our signature collection.',
      ),
    }
  }
  return {
    eyebrow: get('properties', 'discovery_buy', 'eyebrow', 'United Properties · Limassol'),
    title: get('properties', 'discovery_buy', 'title', 'Browse listings'),
    description: get(
      'properties',
      'discovery_buy',
      'description',
      'Apartments, villas, and investment homes in Limassol and surrounding neighbourhoods we serve.',
    ),
  }
}

function getHeroContent(mode, status, get) {
  if (mode === 'rent' || status === 'For Rent') {
    return {
      modeClass: 'properties-hero--rent',
      eyebrow: get('properties', 'hero_rent', 'eyebrow', 'Rent in Limassol'),
      title: get('properties', 'hero_rent', 'title', 'Exclusive Rental Homes'),
      description: get(
        'properties',
        'hero_rent',
        'description',
        'Browse premium apartments, villas, and furnished residences in Limassol — short and long-term.',
      ),
      jumpCta: get('properties', 'hero_rent', 'jump_cta', 'Jump to Listings'),
      pageTitle: 'Rent Properties | United Properties',
    }
  }

  if (mode === 'sold' || status === 'Sold') {
    return {
      modeClass: 'properties-hero--buy',
      eyebrow: get('properties', 'hero_sold', 'eyebrow', 'Sold by United Properties'),
      title: get('properties', 'hero_sold', 'title', 'Sold Properties'),
      description: get(
        'properties',
        'hero_sold',
        'description',
        'Homes successfully sold through United Properties.',
      ),
      jumpCta: get('properties', 'hero_sold', 'jump_cta', 'Jump to Listings'),
      pageTitle: 'Sold Properties | United Properties',
    }
  }

  if (mode === 'rented' || status === 'Rented') {
    return {
      modeClass: 'properties-hero--rent',
      eyebrow: get('properties', 'hero_rented', 'eyebrow', 'Let by United Properties'),
      title: get('properties', 'hero_rented', 'title', 'Rented Properties'),
      description: get(
        'properties',
        'hero_rented',
        'description',
        'Homes and apartments successfully leased through our team.',
      ),
      jumpCta: get('properties', 'hero_rented', 'jump_cta', 'Jump to Listings'),
      pageTitle: 'Rented Properties | United Properties',
    }
  }

  if (mode === 'featured') {
    return {
      modeClass: 'properties-hero--buy',
      eyebrow: get('properties', 'hero_featured', 'eyebrow', 'Featured collection'),
      title: get('properties', 'hero_featured', 'title', 'Featured properties'),
      description: get(
        'properties',
        'hero_featured',
        'description',
        'Hand-picked listings our advisors are highlighting this season.',
      ),
      jumpCta: get('properties', 'hero_featured', 'jump_cta', 'Jump to Listings'),
      pageTitle: 'Featured Properties | United Properties',
    }
  }

  if (mode === 'signature') {
    return {
      modeClass: 'properties-hero--buy',
      eyebrow: get('properties', 'hero_signature', 'eyebrow', 'Signature Collection'),
      title: get('properties', 'hero_signature', 'title', 'Signature listings'),
      description: get(
        'properties',
        'hero_signature',
        'description',
        'Trophy homes and standout residences from our signature collection.',
      ),
      jumpCta: get('properties', 'hero_signature', 'jump_cta', 'Jump to Listings'),
      pageTitle: 'Signature Listings | United Properties',
    }
  }

  return {
    modeClass: 'properties-hero--buy',
    eyebrow: get('properties', 'hero_buy', 'eyebrow', 'Buy in Limassol'),
    title: get('properties', 'hero_buy', 'title', 'Your New Home Awaits'),
    description: get(
      'properties',
      'hero_buy',
      'description',
      'Explore curated residences in Limassol — from seafront apartments to family villas and investment opportunities.',
    ),
    jumpCta: get('properties', 'hero_buy', 'jump_cta', 'Jump to Listings'),
    pageTitle: 'Properties | United Properties',
  }
}

function Properties() {
  const routeLocation = useLocation()
  const { get } = useSiteContent()
  const { list: allProperties } = useMergedProperties()
  const [filters, setFilters] = useState(() => getFiltersFromLocation(routeLocation))
  const [visibleCount, setVisibleCount] = useState(6)
  const mode = useMemo(() => getModeFromRoute(routeLocation), [routeLocation])
  const heroContent = useMemo(
    () => getHeroContent(mode, filters.status, get),
    [mode, filters.status, get],
  )
  const discoveryIntro = useMemo(() => getDiscoveryIntro(mode, get), [mode, get])

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
            {heroContent.jumpCta}
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
            <p className="properties__result-count">
              {filtered.length}{' '}
              {get('properties', 'results', 'count_suffix', 'matching properties')}
            </p>

            {visibleProperties.length ? (
              <>
                <div className="grid-3">
                  {visibleProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} variant="cover" />
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div className="properties__loadmore">
                    <button className="btn btn-outline-dark" onClick={() => setVisibleCount((count) => count + 3)}>
                      {get('properties', 'results', 'load_more', 'Load More')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="properties__empty card-luxury">
                <h3>{get('properties', 'results', 'empty_heading', 'No properties match your filters')}</h3>
                <p>
                  {get(
                    'properties',
                    'results',
                    'empty_body',
                    'Adjust your criteria to discover more listings.',
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Properties
