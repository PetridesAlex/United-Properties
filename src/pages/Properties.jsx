import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import { properties } from '../data/properties'
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

function getFiltersFromSearch(search) {
  const params = new URLSearchParams(search)
  return {
    ...initialFilters,
    location: params.get('location') || '',
    type: params.get('type') || '',
    status: params.get('status') || '',
    featured: params.get('featured') || '',
    keyword: params.get('keyword') || '',
  }
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
      pageTitle: 'Rent Properties | UNITED PROPERTIES',
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
      pageTitle: 'New Developments | UNITED PROPERTIES',
    }
  }

  return {
    modeClass: 'properties-hero--buy',
    eyebrow: 'Buy in Cyprus',
    lead: 'Find your next address in Cyprus.',
    title: 'Your New Home Awaits',
    description:
      'Explore curated residences by location and discover properties that match your lifestyle and investment goals.',
    pageTitle: 'Properties | UNITED PROPERTIES',
  }
}

function Properties() {
  const location = useLocation()
  const [filters, setFilters] = useState(() => getFiltersFromSearch(location.search))
  const [visibleCount, setVisibleCount] = useState(6)
  const mode = useMemo(
    () => new URLSearchParams(location.search).get('mode') || '',
    [location.search],
  )
  const heroContent = useMemo(
    () => getHeroContent(mode, filters.status),
    [mode, filters.status],
  )
  const isBuyMode = mode === 'buy' || filters.status === 'For Sale'

  useEffect(() => {
    setFilters(getFiltersFromSearch(location.search))
    setVisibleCount(6)
  }, [location.search])

  const filtered = useMemo(() => {
    const keyword = filters.keyword.toLowerCase()
    const result = properties.filter((property) => {
      const matchesLocation = !filters.location || property.location === filters.location
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
        [property.title, property.location, property.description, property.type]
          .join(' ')
          .toLowerCase()
          .includes(keyword)

      return (
        matchesLocation &&
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
  }, [filters])

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
            {isBuyMode ? (
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
            ) : (
              <>
                <p className="properties-discovery__eyebrow">The Boldest</p>
                <h2>New Developments</h2>
                <p className="properties-discovery__description">
                  Explore transformative new buildings that redefine modern luxury living and help
                  you Move Forward.
                </p>
              </>
            )}
          </header>

          {!isBuyMode && (
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
            <p className="properties__result-count">{filtered.length} matching properties</p>

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
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="properties__empty card-luxury">
                <h3>No properties match your filters</h3>
                <p>Adjust your criteria to discover more listings.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Properties
