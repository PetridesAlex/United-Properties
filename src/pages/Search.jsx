import {useEffect, useMemo, useRef, useState} from 'react'
import {Helmet} from 'react-helmet-async'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {searchCities as defaultCities} from '../data/searchDiscoveryProperties'
import {useMergedProperties} from '../hooks/useMergedProperties'
import {useSiteContent} from '../hooks/useSiteContent'
import {
  BEDROOM_OPTIONS,
  buildSearchPath,
  normalizeSearchCategory,
  parsePositiveInt,
  pricePresetsForCategory,
} from '../lib/search/searchPath'
import SearchBar from '../components/SearchPanel/SearchBar'
import CityFilters from '../components/SearchPanel/CityFilters'
import CategoryFilters from '../components/SearchPanel/CategoryFilters'
import BedroomFilters from '../components/SearchPanel/BedroomFilters'
import PriceFilters from '../components/SearchPanel/PriceFilters'
import DiscoveryResults from '../components/SearchPanel/DiscoveryResults'
import SearchMap from '../components/SearchPanel/SearchMap'
import '../components/SearchPanel/SearchPanel.css'
import './Search.css'

const LISTING_FILTERS = ['All Listings', 'For Sale', 'For Rent', 'Featured']

function extractCity(location = '') {
  const parts = String(location)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (!parts.length) return ''
  return parts[parts.length - 1]
}

function readFiltersFromParams(searchParams) {
  return {
    query: searchParams.get('q') || '',
    city: searchParams.get('city') || 'All Cyprus',
    category: normalizeSearchCategory(searchParams.get('type') || 'All Listings'),
    bedrooms: parsePositiveInt(searchParams.get('beds')),
    minPrice: parsePositiveInt(searchParams.get('min')),
    maxPrice: parsePositiveInt(searchParams.get('max')),
  }
}

function formatEuro(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function Search() {
  const {get} = useSiteContent()
  const {list: properties, loading} = useMergedProperties()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const skipParamSyncRef = useRef(false)

  const initial = readFiltersFromParams(searchParams)
  const [query, setQuery] = useState(initial.query)
  const [activeCity, setActiveCity] = useState(initial.city)
  const [activeCategory, setActiveCategory] = useState(initial.category)
  const [bedrooms, setBedrooms] = useState(initial.bedrooms)
  const [minPrice, setMinPrice] = useState(initial.minPrice)
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice)

  useEffect(() => {
    if (skipParamSyncRef.current) {
      skipParamSyncRef.current = false
      return
    }
    const next = readFiltersFromParams(searchParams)
    setQuery(next.query)
    setActiveCity(next.city)
    setActiveCategory(next.category)
    setBedrooms(next.bedrooms)
    setMinPrice(next.minPrice)
    setMaxPrice(next.maxPrice)
  }, [searchParams])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = buildSearchPath({
        query,
        city: activeCity,
        category: activeCategory,
        bedrooms,
        minPrice,
        maxPrice,
      })
      const current = `${window.location.pathname}${window.location.search}`
      if (next === current) return
      skipParamSyncRef.current = true
      navigate(next, {replace: true})
    }, 160)
    return () => window.clearTimeout(timer)
  }, [query, activeCity, activeCategory, bedrooms, minPrice, maxPrice, navigate])

  // If min > max after a change, clear the conflicting bound.
  useEffect(() => {
    if (minPrice > 0 && maxPrice > 0 && minPrice > maxPrice) {
      setMaxPrice(0)
    }
  }, [minPrice, maxPrice])

  const cities = useMemo(() => {
    const fromListings = new Set()
    properties.forEach((property) => {
      const city = extractCity(property.location) || property.location
      if (city) fromListings.add(city)
    })
    const known = defaultCities.filter((city) => city === 'All Cyprus' || fromListings.has(city))
    const extras = [...fromListings].filter((city) => !defaultCities.includes(city)).sort()
    return [...known, ...extras]
  }, [properties])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return properties.filter((property) => {
      const city = extractCity(property.location) || property.location
      const matchesCity =
        activeCity === 'All Cyprus' || city === activeCity || property.location?.includes(activeCity)

      const matchesCategory =
        activeCategory === 'All Listings' ||
        (activeCategory === 'For Sale' && property.status === 'For Sale') ||
        (activeCategory === 'For Rent' && property.status === 'For Rent') ||
        (activeCategory === 'Featured' && (property.featured || property.isSignature))

      const beds = Number(property.bedrooms) || 0
      const matchesBeds = bedrooms <= 0 || beds >= bedrooms

      const price = Number(property.price) || 0
      const matchesMin = minPrice <= 0 || price >= minPrice
      const matchesMax = maxPrice <= 0 || price <= maxPrice

      const matchesQuery =
        !normalized ||
        [property.title, property.location, property.type, property.status, property.address]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)

      return (
        matchesCity &&
        matchesCategory &&
        matchesBeds &&
        matchesMin &&
        matchesMax &&
        matchesQuery
      )
    })
  }, [properties, activeCity, activeCategory, bedrooms, minPrice, maxPrice, query])

  const mapProperties = useMemo(
    () =>
      filtered.map((property) => ({
        ...property,
        city: extractCity(property.location) || property.location,
      })),
    [filtered],
  )

  function resetFilters() {
    setQuery('')
    setActiveCity('All Cyprus')
    setActiveCategory('All Listings')
    setBedrooms(0)
    setMinPrice(0)
    setMaxPrice(0)
  }

  function handleCategoryChange(nextCategory) {
    setActiveCategory(nextCategory)
    const presets = pricePresetsForCategory(nextCategory)
    if (!presets.min.some((option) => option.value === minPrice)) setMinPrice(0)
    if (!presets.max.some((option) => option.value === maxPrice)) setMaxPrice(0)
  }

  const activeFilterChips = useMemo(() => {
    const chips = []
    if (activeCity !== 'All Cyprus') chips.push({key: 'city', label: activeCity})
    if (activeCategory !== 'All Listings') chips.push({key: 'type', label: activeCategory})
    if (bedrooms > 0) {
      const option = BEDROOM_OPTIONS.find((item) => item.value === bedrooms)
      chips.push({key: 'beds', label: `${option?.label || bedrooms}+ beds`})
    }
    if (minPrice > 0) chips.push({key: 'min', label: `From ${formatEuro(minPrice)}`})
    if (maxPrice > 0) chips.push({key: 'max', label: `Up to ${formatEuro(maxPrice)}`})
    if (query.trim()) chips.push({key: 'q', label: `“${query.trim()}”`})
    return chips
  }, [activeCity, activeCategory, bedrooms, minPrice, maxPrice, query])

  const matchLabel =
    filtered.length === 1
      ? get('search', 'stat', 'match_singular', 'home')
      : get('search', 'stat', 'match_plural', 'homes')

  const heading = get('search', 'head', 'heading', 'Search homes')
  const description = get(
    'search',
    'head',
    'description',
    'Filter by location, bedrooms, and budget. Results update as you refine.',
  )

  return (
    <>
      <Helmet>
        <title>{heading} | United Properties</title>
        <meta name="description" content={description} />
      </Helmet>

      <section
        className="section section--light search-page"
        data-cms-page="search"
        data-cms-section="head"
      >
        <div className="container search-page__shell">
          <header className="search-page__head">
            <div className="search-page__head-glow" aria-hidden="true" />
            <div className="search-page__head-copy">
              <p className="search-page__eyebrow">
                {get('search', 'head', 'eyebrow', 'United Properties · Search')}
              </p>
              <h1 className="search-page__title">{heading}</h1>
              <p className="search-page__sub">{description}</p>
            </div>
            <output className="search-page__stat" aria-live="polite">
              <span className="search-page__stat-value">{loading ? '…' : filtered.length}</span>
              <span className="search-page__stat-label">{matchLabel}</span>
            </output>
          </header>

          <div className="search-page__layout">
            <aside className="search-page__sidebar" aria-label="Search filters">
              <div className="search-page__sidebar-card search-panel__toolbar">
                <div className="search-page__sidebar-top">
                  <p className="search-page__sidebar-title">Filters</p>
                  <button type="button" className="search-panel__reset" onClick={resetFilters}>
                    {get('search', 'filters', 'clear', 'Clear all')}
                  </button>
                </div>

                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder={get(
                    'search',
                    'filters',
                    'search_placeholder',
                    'Search by name or area…',
                  )}
                />
                <CityFilters
                  cities={cities}
                  activeCity={activeCity}
                  onSelect={setActiveCity}
                  locationLabel={get('search', 'filters', 'location_label', 'Location')}
                />
                <CategoryFilters
                  categories={LISTING_FILTERS}
                  activeCategory={activeCategory}
                  onSelect={handleCategoryChange}
                  onReset={resetFilters}
                  categoryLabel={get('search', 'filters', 'category_label', 'Type')}
                  clearLabel={get('search', 'filters', 'clear', 'Clear')}
                />
                <BedroomFilters
                  value={bedrooms}
                  onSelect={setBedrooms}
                  label={get('search', 'filters', 'bedrooms_label', 'Bedrooms')}
                />
                <PriceFilters
                  category={activeCategory}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinChange={setMinPrice}
                  onMaxChange={setMaxPrice}
                  label={get('search', 'filters', 'price_label', 'Price')}
                  minLabel={get('search', 'filters', 'price_min', 'Minimum')}
                  maxLabel={get('search', 'filters', 'price_max', 'Maximum')}
                />
              </div>
            </aside>

            <div className="search-page__main">
              <div className="search-page__listings">
                <div className="search-page__results-bar">
                  <p className="search-page__results-count">
                    {loading ? 'Loading homes…' : `${filtered.length} ${matchLabel}`}
                  </p>
                  {activeFilterChips.length ? (
                    <div className="search-page__active-filters" aria-label="Active filters">
                      {activeFilterChips.map((chip) => (
                        <span key={chip.key} className="search-page__active-chip">
                          {chip.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="search-page__results-hint">Showing all available listings</p>
                  )}
                </div>

                <DiscoveryResults
                  properties={filtered}
                  loading={loading}
                  emptyTitle={get('search', 'empty', 'title', 'No matches')}
                  emptyHint={get(
                    'search',
                    'empty',
                    'hint',
                    'Try another location, clear filters, or broaden your search.',
                  )}
                />
              </div>

              <aside className="search-page__map-panel" aria-label="Map view">
                <div className="search-page__map-head">
                  <div>
                    <p className="search-page__map-eyebrow">
                      {get('search', 'map', 'heading', 'Map')}
                    </p>
                    <h2 className="search-page__map-title">Explore on the map</h2>
                    <p className="search-page__map-sub">
                      {activeCity === 'All Cyprus'
                        ? 'Homes across Cyprus — refine filters to focus the view.'
                        : `Focused on ${activeCity} and nearby areas.`}
                    </p>
                  </div>
                  <output className="search-page__map-stat" aria-live="polite">
                    <span className="search-page__map-stat-value">{filtered.length}</span>
                    <span className="search-page__map-stat-label">on map</span>
                  </output>
                </div>
                <SearchMap
                  properties={mapProperties}
                  activeCity={activeCity}
                  className="search-page__map-canvas"
                  interactive
                />
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Search
