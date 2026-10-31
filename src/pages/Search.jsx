import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import ListingFilters from '../components/ListingFilters/ListingFilters'
import { EMPTY_FILTERS, applyListingFilters, isFiltered } from '../lib/search/listingFilters'
import { useMergedProperties } from '../hooks/useMergedProperties'
import './Properties.css'
import './Search.css'

function useNavbarOffset() {
  const [top, setTop] = useState(0)

  useEffect(() => {
    function measure() {
      const nav = document.querySelector('header.navbar')
      const next = nav ? Math.round(nav.getBoundingClientRect().height) : 0
      setTop((prev) => (prev === next ? prev : next))
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [])

  return top
}

const TYPE_ALIASES = {
  apartments: 'apartments',
  apartment: 'apartments',
  houses: 'houses',
  house: 'houses',
  villa: 'houses',
  villas: 'houses',
  offices: 'offices',
  office: 'offices',
  land: 'land',
}

function readFilters(params) {
  const f = { ...EMPTY_FILTERS }
  f.keyword = params.get('q') || ''
  const type = (params.get('type') || '').toLowerCase()
  if (type === 'for sale') f.listing = 'For Sale'
  else if (type === 'for rent') f.listing = 'For Rent'
  else if (TYPE_ALIASES[type]) f.type = TYPE_ALIASES[type]
  const listing = params.get('listing')
  if (listing === 'sale') f.listing = 'For Sale'
  if (listing === 'rent') f.listing = 'For Rent'
  const city = params.get('city') || ''
  if (city && city !== 'All Cyprus') f.city = city
  f.minPrice = params.get('min') || ''
  f.maxPrice = params.get('max') || ''
  const beds = params.get('beds')
  if (beds) f.bedrooms = beds
  return f
}

function writeFilters(f) {
  const p = new URLSearchParams()
  if (f.keyword) p.set('q', f.keyword)
  if (f.listing) p.set('listing', f.listing === 'For Sale' ? 'sale' : 'rent')
  if (f.type) p.set('type', f.type)
  if (f.city) p.set('city', f.city)
  if (f.minPrice) p.set('min', f.minPrice)
  if (f.maxPrice) p.set('max', f.maxPrice)
  if (f.bedrooms) p.set('beds', f.bedrooms)
  return p
}

function Search() {
  const topOffset = useNavbarOffset()
  const { list: properties, loading } = useMergedProperties()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => readFilters(searchParams))

  useEffect(() => {
    const next = writeFilters(filters).toString()
    if (next !== searchParams.toString()) setSearchParams(next ? `?${next}` : '', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const results = useMemo(() => applyListingFilters(properties, filters), [properties, filters])
  const clear = () => setFilters({ ...EMPTY_FILTERS })
  const count = loading ? '…' : results.length
  const label = results.length === 1 ? 'matching property' : 'matching properties'

  return (
    <>
      <Helmet>
        <title>Explore properties | United Properties</title>
        <meta
          name="description"
          content="Search apartments, houses, offices and land in Limassol by location, type and price."
        />
      </Helmet>

      <div className="up-buy up-find" style={{ '--up-top': `${topOffset}px` }}>
        <section className="up-buy__hero">
          <div className="up-buy__shell up-buy__hero-inner">
            <span className="lbl">SEARCH</span>
            <h1 className="intro-title">
              <span className="bw" style={{ animationDelay: '0.05s' }}>Explore </span>
              <span className="bw" style={{ animationDelay: '0.15s' }}>properties</span>
            </h1>
          </div>
        </section>

        <section className="lv">
          <div className="up-find__row">
            <ListingFilters
              variant="box"
              id="search-filters"
              filters={filters}
              onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
              onClear={clear}
              pool={properties}
              count={results.length}
            />
            <div className="up-find__col">
              <p className="lvc">
                {count} {label}
              </p>
              {results.length ? (
                <div className="grid up-find__grid">
                  {results.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      imageSizes="(max-width: 760px) 94vw, (max-width: 1100px) 46vw, 30vw"
                    />
                  ))}
                </div>
              ) : loading ? null : (
                <div className="up-find__empty">
                  <span className="lbl">NO MATCH</span>
                  <p className="up-find__none">No properties match these filters.</p>
                  <p className="up-find__off">
                    Not every property is listed publicly. Speak with one of our consultants about
                    off-market opportunities.
                  </p>
                  <div className="up-find__acts">
                    <Link className="up-find__btn" to="/contact">
                      Speak with a consultant
                    </Link>
                    {isFiltered(filters) ? (
                      <button type="button" className="up-find__lnk" onClick={clear}>
                        Clear filters
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="up-find__ctaband">
          <div className="up-find__cta">
            <span className="lbl">UNITED PROPERTIES</span>
            <h2>What is your story?</h2>
            <p className="sty">A few personal questions help us begin the right way.</p>
            <div>
              <Link className="up-find__btn up-find__btn--lt" to="/contact">
                Answer a few questions
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Search
