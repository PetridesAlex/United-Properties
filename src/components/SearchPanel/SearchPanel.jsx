import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  searchCategories,
  searchCities,
  searchDiscoveryProperties,
} from '../../data/searchDiscoveryProperties'
import { useSiteContent } from '../../hooks/useSiteContent'
import SearchBar from './SearchBar'
import CityFilters from './CityFilters'
import CategoryFilters from './CategoryFilters'
import DiscoveryResults from './DiscoveryResults'
import SearchMap from './SearchMap'
import './SearchPanel.css'

function SearchPanel({ open, onClose, seed = null, seedKey = 0 }) {
  const { get } = useSiteContent()
  const [query, setQuery] = useState('')
  const [activeCity, setActiveCity] = useState('All Cyprus')
  const [activeCategory, setActiveCategory] = useState('All Listings')

  const filteredBase = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return searchDiscoveryProperties.filter((property) => {
      const matchesCity = activeCity === 'All Cyprus' || property.city === activeCity
      const matchesCategory =
        activeCategory === 'All Listings' ||
        (activeCategory === 'Featured Properties' && property.isFeatured) ||
        (activeCategory === 'Signature Listings' && property.isSignature)

      const matchesQuery =
        !normalized ||
        [
          property.title,
          property.city,
          property.area,
          property.category,
          property.type,
          property.badges.join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalized)

      return matchesCity && matchesCategory && matchesQuery
    })
  }, [activeCity, activeCategory, query])
  const mapProperties = filteredBase.length ? filteredBase : searchDiscoveryProperties

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
    /* iOS/Safari: overflow:hidden on html/body often breaks momentum scroll inside fixed modals.
       Locking the page with position:fixed preserves scroll position and lets the panel scroll with touch. */
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
      setActiveCategory(seed.category ?? 'All Listings')
    } else {
      setQuery('')
      setActiveCity('All Cyprus')
      setActiveCategory('All Listings')
    }
    // seedKey is bumped whenever the hero opens the panel; seed matches that open
  }, [open, seedKey, seed])

  if (!open) return null

  const matchLabel =
    filteredBase.length === 1
      ? get('search', 'stat', 'match_singular', 'match')
      : get('search', 'stat', 'match_plural', 'matches')

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
          <p className="search-panel__eyebrow">
            {get('search', 'head', 'eyebrow', 'United Properties · Search')}
          </p>
          <h2 id="search-panel-title" className="search-panel__title">
            {get('search', 'head', 'heading', 'Explore listings')}
          </h2>
          <p className="search-panel__sub">
            {get(
              'search',
              'head',
              'description',
              'Narrow your criteria in the filter column — results and map update as you go.',
            )}
          </p>
        </header>

        <div className="search-panel__body">
          <aside
            className="search-panel__sidebar"
            id="search-panel-filters"
            aria-label="Search filters"
          >
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={get(
                'search',
                'filters',
                'search_placeholder',
                'Search properties, locations, featured...',
              )}
            />

            <CityFilters
              cities={searchCities}
              activeCity={activeCity}
              onSelect={setActiveCity}
              locationLabel={get('search', 'filters', 'location_label', 'Location')}
            />
            <CategoryFilters
              categories={searchCategories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
              onReset={resetFilters}
              categoryLabel={get('search', 'filters', 'category_label', 'Listing type')}
              clearLabel={get('search', 'filters', 'clear', 'Clear all')}
            />
          </aside>

          <div className="search-panel__main">
            <output
              className="search-panel__stat search-panel__stat--main"
              htmlFor="search-panel-filters"
              aria-live="polite"
            >
              <span className="search-panel__stat-value">{filteredBase.length}</span>
              <span className="search-panel__stat-label">{matchLabel}</span>
            </output>
            <DiscoveryResults
              properties={filteredBase}
              emptyTitle={get('search', 'empty', 'title', 'No matches')}
              emptyHint={get(
                'search',
                'empty',
                'hint',
                'Relax a filter or clear the search to see more listings.',
              )}
            />

            <div className="search-panel__map-wrap">
              <p className="search-panel__section-title">
                {get('search', 'map', 'heading', 'Explore Cyprus on Map')}
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
