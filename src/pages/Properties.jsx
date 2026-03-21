import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import FilterBar from '../components/FilterBar/FilterBar'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import { properties } from '../data/properties'
import './Properties.css'

const initialFilters = {
  location: '',
  type: '',
  status: '',
  bedrooms: '',
  bathrooms: '',
  minPrice: '',
  maxPrice: '',
  keyword: '',
}

function getFiltersFromSearch(search) {
  const params = new URLSearchParams(search)
  return {
    ...initialFilters,
    location: params.get('location') || '',
    type: params.get('type') || '',
    status: params.get('status') || '',
    keyword: params.get('keyword') || '',
  }
}

function Properties() {
  const location = useLocation()
  const [filters, setFilters] = useState(() => getFiltersFromSearch(location.search))
  const [sort, setSort] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(6)

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
        matchesBeds &&
        matchesBaths &&
        matchesMin &&
        matchesMax &&
        matchesKeyword
      )
    })

    if (sort === 'priceLow') result.sort((a, b) => a.price - b.price)
    if (sort === 'priceHigh') result.sort((a, b) => b.price - a.price)
    return result
  }, [filters, sort])

  const visibleProperties = filtered.slice(0, visibleCount)

  return (
    <>
      <Helmet>
        <title>Properties | UNITED PROPERTIES</title>
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p>Properties</p>
          <h1>Cyprus Luxury Listings</h1>
          <p>
            Browse curated homes, rentals, and investment opportunities with advanced
            filtering and market-focused sorting.
          </p>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeader title="Search and Filter Listings" />
          <FilterBar filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} />
          <p className="properties__result-count">{filtered.length} matching properties</p>

          {visibleProperties.length ? (
            <>
              <div className="grid-3">
                {visibleProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
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
      </section>
    </>
  )
}

export default Properties
