import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  searchCategories,
  searchCities,
  searchDiscoveryProperties,
} from '../../data/searchDiscoveryProperties'
import SearchBar from './SearchBar'
import CityFilters from './CityFilters'
import CategoryFilters from './CategoryFilters'
import PropertyGrid from './PropertyGrid'
import SearchMap from './SearchMap'
import './SearchPanel.css'

function SearchPanel({ open, onClose }) {
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
        (activeCategory === 'New Developments' && property.isNewDevelopment) ||
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
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="search-panel-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <section className="search-panel" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="search-panel__close" aria-label="Close search panel" onClick={onClose}>
          <X size={18} />
        </button>

        <h2>Search</h2>
        <SearchBar value={query} onChange={setQuery} />

        <CityFilters cities={searchCities} activeCity={activeCity} onSelect={setActiveCity} />
        <CategoryFilters
          categories={searchCategories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          onReset={resetFilters}
        />

        <PropertyGrid activeCategory={activeCategory} />

        <div className="search-panel__map-wrap">
          <p className="search-panel__section-title">Explore Cyprus on Map</p>
          <SearchMap properties={mapProperties} activeCity={activeCity} />
        </div>
      </section>
    </div>
  )
}

export default SearchPanel
