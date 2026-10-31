import { Fragment, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useLocation } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import ListingFilters from '../components/ListingFilters/ListingFilters'
import { EMPTY_FILTERS, applyListingFilters } from '../lib/search/listingFilters'
import CmsText from '../components/CmsPreview/CmsText'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { useSiteContent } from '../hooks/useSiteContent'
import { matchesListingLocation } from '../lib/matchesListingLocation'
import './Properties.css'

const BUY_HEADING_WORDS = ['Find', 'a', 'place', 'that', 'becomes', 'your', 'future.']
const RENT_HEADING_WORDS = ['Find', 'a', 'place', 'to', 'call', 'home.']

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
    const eyebrowRaw = get('properties', 'discovery_rent', 'eyebrow', 'United Properties')
    const titleRaw = get('properties', 'discovery_rent', 'title', 'Browse rentals')
    const descriptionRaw = get(
      'properties',
      'discovery_rent',
      'description',
      'Apartments, villas, furnished homes and offices to rent.',
    )

    return {
      eyebrow: /limassol rentals/i.test(String(eyebrowRaw || ''))
        ? 'United Properties'
        : eyebrowRaw,
      title: /homes\s*&\s*apartments to lease|homes and apartments to lease/i.test(
        String(titleRaw || ''),
      )
        ? 'Browse rentals'
        : titleRaw,
      description: /long-term and seasonal|prime limassol districts/i.test(
        String(descriptionRaw || ''),
      )
        ? 'Apartments, villas, furnished homes and offices to rent.'
        : descriptionRaw,
      note: get(
        'properties',
        'discovery_rent',
        'off_market',
        'Not every property is listed publicly. Speak with one of our consultants about off-market options.',
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
      note: '',
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
      note: '',
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
      note: '',
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
      note: '',
    }
  }

  const descriptionRaw = get(
    'properties',
    'discovery_buy',
    'description',
    'Apartments, villas and investment homes.',
  )
  const description = /surrounding neighbourhoods|neighborhoods we serve/i.test(
    String(descriptionRaw || ''),
  )
    ? 'Apartments, villas and investment homes.'
    : descriptionRaw

  return {
    eyebrow: /limassol/i.test(
      String(get('properties', 'discovery_buy', 'eyebrow', 'United Properties') || ''),
    )
      ? 'United Properties'
      : get('properties', 'discovery_buy', 'eyebrow', 'United Properties'),
    title: get('properties', 'discovery_buy', 'title', 'Browse listings'),
    description,
    note: get(
      'properties',
      'discovery_buy',
      'off_market',
      'Not every property is listed publicly. Speak with one of our consultants about off-market opportunities.',
    ),
  }
}

function getHeroContent(mode, status, get) {
  if (mode === 'rent' || status === 'For Rent') {
    const titleRaw = get('properties', 'hero_rent', 'title', 'Find a place to call home.')
    const title = /exclusive rental homes/i.test(String(titleRaw || ''))
      ? 'Find a place to call home.'
      : titleRaw

    const descriptionRaw = get(
      'properties',
      'hero_rent',
      'description',
      'From apartments and family villas to furnished residences and offices, available for long-term rent.',
    )
    const description = /browse premium apartments|short and long-term/i.test(
      String(descriptionRaw || ''),
    )
      ? 'From apartments and family villas to furnished residences and offices, available for long-term rent.'
      : descriptionRaw

    const eyebrowRaw = get('properties', 'hero_rent', 'eyebrow', 'Rent')
    const eyebrow = /rent in limassol/i.test(String(eyebrowRaw || '')) ? 'Rent' : eyebrowRaw
    const animated = /^find\s+a\s+place\s+to\s+call\s+home\.?$/i.test(String(title || ''))

    return {
      eyebrow,
      title,
      description,
      pageTitle: 'Rent Properties | United Properties',
      cmsSection: 'hero_rent',
      animated,
      headingWords: animated ? RENT_HEADING_WORDS : null,
      breakAfter: null,
    }
  }

  if (mode === 'sold' || status === 'Sold') {
    return {
      eyebrow: get('properties', 'hero_sold', 'eyebrow', 'Sold'),
      title: get('properties', 'hero_sold', 'title', 'Sold Properties'),
      description: get(
        'properties',
        'hero_sold',
        'description',
        'Homes successfully sold through United Properties.',
      ),
      pageTitle: 'Sold Properties | United Properties',
      cmsSection: 'hero_sold',
      animated: false,
    }
  }

  if (mode === 'rented' || status === 'Rented') {
    return {
      eyebrow: get('properties', 'hero_rented', 'eyebrow', 'Rented'),
      title: get('properties', 'hero_rented', 'title', 'Rented Properties'),
      description: get(
        'properties',
        'hero_rented',
        'description',
        'Homes and apartments successfully leased through our team.',
      ),
      pageTitle: 'Rented Properties | United Properties',
      cmsSection: 'hero_rented',
      animated: false,
    }
  }

  if (mode === 'featured') {
    return {
      eyebrow: get('properties', 'hero_featured', 'eyebrow', 'Featured'),
      title: get('properties', 'hero_featured', 'title', 'Featured properties'),
      description: get(
        'properties',
        'hero_featured',
        'description',
        'Hand-picked listings our advisors are highlighting this season.',
      ),
      pageTitle: 'Featured Properties | United Properties',
      cmsSection: 'hero_featured',
      animated: false,
    }
  }

  if (mode === 'signature') {
    return {
      eyebrow: get('properties', 'hero_signature', 'eyebrow', 'Signature'),
      title: get('properties', 'hero_signature', 'title', 'Signature listings'),
      description: get(
        'properties',
        'hero_signature',
        'description',
        'Trophy homes and standout residences from our signature collection.',
      ),
      pageTitle: 'Signature Listings | United Properties',
      cmsSection: 'hero_signature',
      animated: false,
    }
  }

  const titleRaw = get(
    'properties',
    'hero_buy',
    'title',
    'Find a place that becomes your future.',
  )
  const title = /your new home awaits|find\s+the\s+place\s+that\s+becomes/i.test(String(titleRaw || ''))
    ? 'Find a place that becomes your future.'
    : titleRaw

  const descriptionRaw = get(
    'properties',
    'hero_buy',
    'description',
    'From apartments to family villas and investment opportunities, every property is chosen with care.',
  )
  const description = /explore curated residences|seafront apartments/i.test(
    String(descriptionRaw || ''),
  )
    ? 'From apartments to family villas and investment opportunities, every property is chosen with care.'
    : descriptionRaw

  const eyebrowRaw = get('properties', 'hero_buy', 'eyebrow', 'Buy')
  const eyebrow = /buy in limassol/i.test(String(eyebrowRaw || '')) ? 'Buy' : eyebrowRaw

  const animated = /^find\s+a\s+place\s+that\s+becomes\s+your\s+future\.?$/i.test(
    String(title || ''),
  )

  return {
    eyebrow,
    title,
    description,
    pageTitle: 'Buy Properties | United Properties',
    cmsSection: 'hero_buy',
    animated,
    headingWords: animated ? BUY_HEADING_WORDS : null,
    breakAfter: animated ? 4 : null,
  }
}

function getDiscoveryCmsSection(mode) {
  if (mode === 'rent') return 'discovery_rent'
  if (mode === 'sold') return 'discovery_sold'
  if (mode === 'rented') return 'discovery_rented'
  if (mode === 'featured') return 'discovery_featured'
  if (mode === 'signature') return 'discovery_signature'
  return 'discovery_buy'
}

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

function Properties() {
  const routeLocation = useLocation()
  const { get } = useSiteContent()
  const { list: allProperties } = useMergedProperties()
  const [reduceMotion, setReduceMotion] = useState(false)
  const topOffset = useNavbarOffset()
  const filters = useMemo(() => getFiltersFromLocation(routeLocation), [routeLocation])
  const locationKey = `${normalizePathname(routeLocation.pathname)}${routeLocation.search}`
  const [loadState, setLoadState] = useState({ key: locationKey, count: 9 })
  const visibleCount = loadState.key === locationKey ? loadState.count : 9
  const mode = useMemo(() => getModeFromRoute(routeLocation), [routeLocation])
  const heroContent = useMemo(
    () => getHeroContent(mode, filters.status, get),
    [mode, filters.status, get],
  )
  const discoveryIntro = useMemo(() => {
    const base = getDiscoveryIntro(mode, get)
    if (mode === 'buy') {
      return {
        ...base,
        eyebrow: 'United Properties',
        title: 'Explore listings',
        description: 'Apartments, villas, offices and investment homes.',
        note: 'Not every property is listed publicly. Speak with one of our consultants about off-market opportunities.',
      }
    }
    if (mode === 'rent') {
      return {
        ...base,
        eyebrow: 'United Properties',
        title: 'Explore rentals',
        description: 'Apartments, villas, furnished homes and offices to rent.',
        note: 'Not every property is listed publicly. Speak with one of our consultants about off-market options.',
      }
    }
    return base
  }, [mode, get])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const baseListing = mode === 'rent' ? 'For Rent' : mode === 'buy' ? 'For Sale' : ''
  const [ui, setUi] = useState({ ...EMPTY_FILTERS, listing: baseListing })
  useEffect(() => {
    setUi({ ...EMPTY_FILTERS, listing: baseListing })
  }, [baseListing])
  const showBar = mode === 'buy' || mode === 'rent'

  const filtered = useMemo(() => {
    if (showBar) {
      return applyListingFilters(
        allProperties.filter((p) => matchesListingLocation(p.location, 'Limassol')),
        ui,
      )
    }
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
  }, [filters, allProperties, showBar, ui])

  const visibleProperties = filtered.slice(0, visibleCount)
  const heroSection = heroContent.cmsSection || 'hero_buy'
  const discoverySection = getDiscoveryCmsSection(mode)
  const countLabel =
    filtered.length === 1
      ? get('properties', 'results', 'count_one', 'matching property')
      : get('properties', 'results', 'count_suffix', 'matching properties').replace(
          /^matching\s+properties$/i,
          'matching properties',
        )

  return (
    <>
      <Helmet>
        <title>{heroContent.pageTitle}</title>
      </Helmet>

      <div className="up-buy" style={{ '--up-top': `${topOffset}px` }}>
        <section
          className="up-buy__hero"
          data-cms-page="properties"
          data-cms-section={heroSection}
        >
          <div className="up-buy__shell up-buy__hero-inner">
            <CmsText
              page="properties"
              section={heroSection}
              field="eyebrow"
              as="span"
              className="lbl"
            >
              {heroContent.eyebrow}
            </CmsText>

            {heroContent.animated && !reduceMotion && heroContent.headingWords ? (
              <h1 className="intro-title" aria-label={heroContent.title}>
                {heroContent.headingWords.map((word, i) => {
                  const isLast = i === heroContent.headingWords.length - 1
                  const breakAfter =
                    typeof heroContent.breakAfter === 'number' && i === heroContent.breakAfter
                  return (
                    <Fragment key={`${word}-${i}`}>
                      <span className="bw" style={{ animationDelay: `${0.05 + i * 0.1}s` }}>
                        {word}
                        {isLast ? '' : ' '}
                      </span>
                      {breakAfter ? <br /> : null}
                    </Fragment>
                  )
                })}
              </h1>
            ) : (
              <CmsText
                page="properties"
                section={heroSection}
                field="title"
                as="h1"
                className="intro-title"
              >
                {heroContent.title}
              </CmsText>
            )}

            {showBar ? null : (
              <CmsText
                page="properties"
                section={heroSection}
                field="description"
                as="p"
                className={`lead${reduceMotion || !heroContent.animated ? '' : ' fc'}`}
              >
                {heroContent.description}
              </CmsText>
            )}
          </div>
        </section>

        <section
          className="lv"
          id="properties-discovery"
          data-cms-page="properties"
          data-cms-section={discoverySection}
        >
          <div className="lv__inner">
            <CmsText
              page="properties"
              section={discoverySection}
              field="eyebrow"
              as="span"
              className="lvl"
            >
              {discoveryIntro.eyebrow}
            </CmsText>
            <CmsText
              page="properties"
              section={discoverySection}
              field="title"
              as="h2"
              className="lvh"
            >
              {discoveryIntro.title}
            </CmsText>
            <CmsText
              page="properties"
              section={discoverySection}
              field="description"
              as="p"
              className="lvp"
            >
              {discoveryIntro.description}
            </CmsText>
            {discoveryIntro.note ? (
              <CmsText
                page="properties"
                section={discoverySection}
                field="off_market"
                as="p"
                className="lvp lvp--note"
              >
                {discoveryIntro.note}
              </CmsText>
            ) : null}
            <div className="lv-rule" aria-hidden />
            {showBar ? (
              <ListingFilters
                filters={ui}
                onChange={(patch) => setUi((prev) => ({ ...prev, ...patch }))}
                onClear={() => setUi({ ...EMPTY_FILTERS, listing: baseListing })}
                pool={allProperties.filter((p) => matchesListingLocation(p.location, 'Limassol'))}
                count={filtered.length}
              />
            ) : null}
            <p className="lvc">
              {filtered.length} {countLabel}
            </p>

            {visibleProperties.length ? (
              <>
                <div className="grid">
                  {visibleProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      imageSizes="(max-width: 760px) 94vw, (max-width: 1100px) 46vw, 32vw"
                    />
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div className="properties__loadmore">
                    <button
                      type="button"
                      className="btn btn-outline-dark"
                      onClick={() =>
                        setLoadState({ key: locationKey, count: visibleCount + 9 })
                      }
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="properties__empty">
                <span className="eb">NO MATCH</span>
                <p className="properties__empty-title">No properties match these filters.</p>
                <p className="properties__empty-off">
                  Not every property is listed publicly. Speak with one of our consultants about off-market{' '}
                  {mode === 'rent' ? 'options' : 'opportunities'}.
                </p>
                <div className="properties__empty-acts">
                  <Link className="properties__btn" to="/contact">
                    Speak with a consultant
                  </Link>
                  <button
                    type="button"
                    className="properties__lnk"
                    onClick={() => setUi({ ...EMPTY_FILTERS, listing: baseListing })}
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default Properties
