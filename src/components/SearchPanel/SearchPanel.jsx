import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { searchCities as defaultCities } from '../../data/searchDiscoveryProperties'
import { useMergedProperties } from '../../hooks/useMergedProperties'
import { useSiteContent } from '../../hooks/useSiteContent'
import SearchBar from './SearchBar'
import CityFilters from './CityFilters'
import CategoryFilters from './CategoryFilters'
import DiscoveryResults from './DiscoveryResults'
import SearchMap from './SearchMap'
import './SearchPanel.css'

const LISTING_FILTERS = ['All Listings', 'For Sale', 'For Rent', 'Featured']

function extractCity(location = '') {
  const parts = String(location)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (!parts.length) return ''
  return parts[parts.length - 1]
}

function normalizeSeedCategory(category) {
  if (!category || category === 'All Listings') return 'All Listings'
  if (category === 'Featured Properties' || category === 'Featured') return 'Featured'
  if (category === 'Signature Listings' || category === 'Signature') return 'Featured'
  if (category === 'For Sale' || category === 'For Rent') return category
  return 'All Listings'
}

function SearchPanel({ open, onClose, seed = null, seedKey = 0 }) {
  const { get } = useSiteContent()
  const { list: properties, loading } = useMergedProperties()
  const [query, setQuery] = useState('')
  const [activeCity, setActiveCity] = useState('All Cyprus')
  const [activeCategory, setActiveCategory] = useState('All Listings')

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
      const matchesCity = activeCity === 'All Cyprus' || city === activeCity || property.location?.includes(activeCity)

      const matchesCategory =
        activeCategory === 'All Listings' ||
        (activeCategory === 'For Sale' && property.status === 'For Sale') ||
        (activeCategory === 'For Rent' && property.status === 'For Rent') ||
        (activeCategory === 'Featured' && (property.featured || property.isSignature))

      const matchesQuery =
        !normalized ||
        [property.title, property.location, property.type, property.status, property.address]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)

      return matchesCity && matchesCategory && matchesQuery
    })
  }, [properties, activeCity, activeCategory, query])

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
  }

  useEffect(() => {
    if (!open) return undefined
    const scrollY = window.scrollY
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.position = previous.position
      document.body.style.top = previous.top
      document.body.style.left = previous.left
      document.body.style.right = previous.right
      document.body.style.width = previous.width
      document.body.style.overflow = previous.overflow
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    if (seed) {
      setQuery(seed.query ?? '')
      setActiveCity(seed.city ?? 'All Cyprus')
      setActiveCategory(normalizeSeedCategory(seed.category))
    } else {
      setQuery('')
      setActiveCity('All Cyprus')
      setActiveCategory('All Listings')
    }
  }, [open, seedKey, seed])

  if (!open) return null

  const matchLabel =
    filtered.length === 1
      ? get('search', 'stat', 'match_singular', 'home')
      : get('search', 'stat', 'match_plural', 'homes')

  return (
    <div
      className="search-panel-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-panel-title"
      data-lenis-prevent
      onClick={onClose}
    >
      <section className="search-panel" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="search-panel__close" aria-label="Close search panel" onClick={onClose}>
          <X className="search-panel__close-icon" size={20} strokeWidth={2.35} aria-hidden />
        </button>

        <header className="search-panel__head">
          <div className="search-panel__head-copy">
            <h2 id="search-panel-title" className="search-panel__title">
              {get('search', 'head', 'heading', 'Search homes')}
            </h2>
            <p className="search-panel__sub">
              {get('search', 'head', 'description', 'Filter by location and listing type. Tap a home to open it.')}
            </p>
          </div>
          <output className="search-panel__stat" htmlFor="search-panel-filters" aria-live="polite">
            <span className="search-panel__stat-value">{loading ? '…' : filtered.length}</span>
            <span className="search-panel__stat-label">{matchLabel}</span>
          </output>
        </header>

        <div className="search-panel__toolbar" id="search-panel-filters" aria-label="Search filters">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={get('search', 'filters', 'search_placeholder', 'Search by name or area…')}
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
            onSelect={setActiveCategory}
            onReset={resetFilters}
            categoryLabel={get('search', 'filters', 'category_label', 'Type')}
            clearLabel={get('search', 'filters', 'clear', 'Clear')}
          />
        </div>

        <div className="search-panel__body">
          <div className="search-panel__main">
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
              onNavigate={onClose}
            />

            <div className="search-panel__map-wrap">
              <p className="search-panel__section-title">
                {get('search', 'map', 'heading', 'Map')}
              </p>
              <SearchMap properties={mapProperties} activeCity={activeCity} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SearchPanel
