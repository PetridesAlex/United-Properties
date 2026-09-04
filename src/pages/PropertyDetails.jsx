import { useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import {
  BedDouble,
  Bath,
  Ruler,
  Car,
  CalendarClock,
  LandPlot,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  Map as MapIcon,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
  FileDown,
  UserRound,
  X,
  ZoomIn,
} from 'lucide-react'
import Gallery from '../components/Gallery/Gallery'
import InquiryForm from '../components/InquiryForm/InquiryForm'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import AnimatedStatValue from '../components/PropertyDetails/AnimatedStatValue'
import PropertyLocationMap from '../components/PropertyDetails/PropertyLocationMap'
import PropertyShareMenu from '../components/PropertyDetails/PropertyShareMenu'
import { agents } from '../data/agents'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { useSiteContent } from '../hooks/useSiteContent'
import { useInViewOnce } from '../hooks/useCountUp'
import { buildPublicPropertyAttributes } from '../lib/properties/publicAttributes'
import { resolvePropertyCoordinates } from '../lib/properties/mapCoords'
import './Properties.css'
import './PropertyDetails.css'

const DESCRIPTION_PREVIEW_CHARS = 280
const SIMILAR_MAX = 3

const PROPERTY_SECTION_IDS = [
  'property-overview',
  'property-description',
  'property-details',
  'property-amenities',
  'property-floorplans',
  'property-location',
  'property-enquire',
]

function scrollToPropertySection(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function hasStatValue(value) {
  if (value == null) return false
  if (typeof value === 'number') return Number.isFinite(value)
  const text = String(value).trim()
  if (!text) return false
  return text.toUpperCase() !== 'N/A'
}

/** Split listing copy into short readable paragraphs. */
function splitDescriptionParagraphs(text) {
  const raw = String(text || '')
    .replace(/\r\n/g, '\n')
    .trim()
  if (!raw) return []

  const byBreak = raw
    .split(/\n{2,}/)
    .map((part) => part.replace(/\n+/g, ' ').trim())
    .filter(Boolean)
  if (byBreak.length > 1) return byBreak

  const single = raw.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
  const sentences = single.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)
  if (!sentences || sentences.length <= 2) return [single]

  const chunks = []
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(
      sentences
        .slice(i, i + 2)
        .map((s) => s.trim())
        .join(' '),
    )
  }
  return chunks
}

function pickSimilarProperties(all, current, max = SIMILAR_MAX) {
  if (!current) return []
  const currentId = String(current.id)
  const others = all.filter((p) => String(p.id) !== currentId)
  const locNorm = (current.location || '').trim().toLowerCase()

  const sameLocation = others.filter((p) => (p.location || '').trim().toLowerCase() === locNorm)
  const sameStatus = others.filter((p) => p.status === current.status)

  const seen = new Set()
  const out = []

  function takeFrom(list) {
    for (const p of list) {
      if (out.length >= max) return
      const id = String(p.id)
      if (seen.has(id)) continue
      seen.add(id)
      out.push(p)
    }
  }

  takeFrom(sameLocation)
  takeFrom(sameStatus)
  if (out.length < max) {
    const rest = others
      .filter((p) => !seen.has(String(p.id)))
      .sort(
        (a, b) =>
          Math.abs(a.price - current.price) - Math.abs(b.price - current.price),
      )
    takeFrom(rest)
  }

  return out
}

function PropertyDetails() {
  const { slug } = useParams()
  const { get } = useSiteContent()
  const { list: allProperties, loading } = useMergedProperties()
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [overviewRef, overviewInView] = useInViewOnce()
  const [floorPlanIndex, setFloorPlanIndex] = useState(0)
  const [floorPlanLightboxOpen, setFloorPlanLightboxOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('property-description')
  const sectionNavRef = useRef(null)

  const property = useMemo(
    () => allProperties.find((item) => item.slug === slug),
    [allProperties, slug],
  )

  const agent = property ? agents.find((item) => item.id === property.agentId) : null

  const similarProperties = useMemo(
    () => (property ? pickSimilarProperties(allProperties, property) : []),
    [allProperties, property],
  )

  const floorPlanImages = useMemo(() => {
    if (!property) return []
    if (Array.isArray(property.floorPlanImages) && property.floorPlanImages.length) {
      return property.floorPlanImages.filter(Boolean)
    }
    return property.floorPlanUrl ? [property.floorPlanUrl] : []
  }, [property])

  useEffect(() => {
    setFloorPlanIndex(0)
    setFloorPlanLightboxOpen(false)
    setActiveSection('property-description')
  }, [property?.id])

  useEffect(() => {
    if (!property) return undefined

    const observed = PROPERTY_SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean)
    if (!observed.length) return undefined

    const visibility = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        let bestId = null
        let bestRatio = 0
        for (const id of PROPERTY_SECTION_IDS) {
          const ratio = visibility.get(id) || 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }
        if (bestId) setActiveSection(bestId)
      },
      {
        root: null,
        rootMargin: '-28% 0px -52% 0px',
        threshold: [0, 0.15, 0.35, 0.55, 0.75],
      },
    )

    observed.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [
    property?.id,
    property?.description,
    property?.features,
    property?.showLocationMap,
    floorPlanImages.length,
  ])

  useEffect(() => {
    const track = sectionNavRef.current
    if (!track) return
    const active = track.querySelector('.property-details__section-nav-link.is-active')
    if (!(active instanceof HTMLElement)) return
    // Horizontal only — never call scrollIntoView (it fights page scroll / sticky).
    const left = active.offsetLeft - (track.clientWidth - active.offsetWidth) / 2
    track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [activeSection])

  useEffect(() => {
    if (!floorPlanLightboxOpen) return undefined
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setFloorPlanLightboxOpen(false)
      } else if (e.key === 'ArrowLeft' && floorPlanImages.length > 1) {
        e.preventDefault()
        setFloorPlanIndex((i) => (i - 1 + floorPlanImages.length) % floorPlanImages.length)
      } else if (e.key === 'ArrowRight' && floorPlanImages.length > 1) {
        e.preventDefault()
        setFloorPlanIndex((i) => (i + 1) % floorPlanImages.length)
      }
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [floorPlanLightboxOpen, floorPlanImages.length])

  if (!property) {
    if (loading) {
      return (
        <>
          <Helmet>
            <title>Loading… | United Properties</title>
          </Helmet>
          <section className="section section--light">
            <div className="container">
              <p className="property-details__loading">
                {get('property', 'not_found', 'loading', 'Loading property…')}
              </p>
            </div>
          </section>
        </>
      )
    }

    return (
      <>
        <Helmet>
          <title>Property not found | United Properties</title>
        </Helmet>
        <section className="section section--light">
          <div className="container property-details property-details--not-found">
            <h1>{get('property', 'not_found', 'heading', 'Property not found')}</h1>
            <p>
              {get(
                'property',
                'not_found',
                'body',
                'This listing may have been removed or the link is incorrect.',
              )}
            </p>
            <Link to="/buy" className="btn btn-gold">
              {get('property', 'not_found', 'cta', 'Browse properties')}
            </Link>
          </div>
        </section>
      </>
    )
  }

  const featureList = Array.isArray(property.features) ? property.features : []
  const floorplanHeading = get('property', 'info_tiles', 'floorplan_heading', 'Floor plan')
  const locationHeading = get('property', 'info_tiles', 'location_heading', 'Location')
  const {facts: attributeFacts, meta: attributeMeta} = buildPublicPropertyAttributes(property)
  const descriptionParagraphs = splitDescriptionParagraphs(property.description)
  const hasFloorPlans = floorPlanImages.length > 0
  const activeFloorPlan =
    floorPlanImages[Math.min(floorPlanIndex, Math.max(floorPlanImages.length - 1, 0))]
  const mapCoords = resolvePropertyCoordinates({
    latitude: property.latitude,
    longitude: property.longitude,
    location: property.location,
    address: property.address,
    city: property.city,
    area: property.area,
    district: property.district,
  })
  const showLocationMap = Boolean(property.showLocationMap)
  const hasMapPin = showLocationMap && Boolean(mapCoords)
  const mapLatitude = hasMapPin ? mapCoords.latitude : null
  const mapLongitude = hasMapPin ? mapCoords.longitude : null
  const showInfoTiles = !hasFloorPlans || !hasMapPin
  const mapZoom = mapCoords?.source === 'city' ? 12 : mapCoords?.source === 'pin' ? 15 : 14

  const overviewStats = [
    hasStatValue(property.bedrooms)
      ? {
          id: 'bedrooms',
          value: property.bedrooms,
          label: get('property', 'stats', 'label_bedrooms', 'Bedrooms'),
          icon: BedDouble,
          duration: 900,
        }
      : null,
    hasStatValue(property.bathrooms)
      ? {
          id: 'bathrooms',
          value: property.bathrooms,
          label: get('property', 'stats', 'label_bathrooms', 'Bathrooms'),
          icon: Bath,
          duration: 950,
          className: 'property-details__stat--bath',
        }
      : null,
    hasStatValue(property.sqm)
      ? {
          id: 'sqm',
          value: property.sqm,
          label: get('property', 'stats', 'label_sqm', 'sqm internal area'),
          icon: Ruler,
          duration: 1200,
        }
      : null,
    hasStatValue(property.plotSize)
      ? {
          id: 'plot',
          value: property.plotSize,
          label: get('property', 'stats', 'label_plot', 'sqm plot size'),
          icon: LandPlot,
          duration: 1200,
        }
      : null,
    hasStatValue(property.parking)
      ? {
          id: 'parking',
          value: property.parking,
          label: get('property', 'stats', 'label_parking', 'Parking'),
          icon: Car,
          duration: 1000,
        }
      : null,
    hasStatValue(property.yearBuilt)
      ? {
          id: 'built',
          value: property.yearBuilt,
          label: get('property', 'stats', 'label_built', 'Built in'),
          icon: CalendarClock,
          duration: 1400,
        }
      : null,
  ].filter(Boolean)

  const sectionLinks = [
    overviewStats.length
      ? { id: 'property-overview', label: get('property', 'nav', 'overview', 'Overview') }
      : null,
    { id: 'property-description', label: get('property', 'nav', 'description', 'Description') },
    attributeFacts.length > 0 || attributeMeta.length > 0
      ? { id: 'property-details', label: get('property', 'nav', 'details', 'Property details') }
      : null,
    featureList.length > 0
      ? { id: 'property-amenities', label: get('property', 'nav', 'amenities', 'Amenities') }
      : null,
    hasFloorPlans
      ? { id: 'property-floorplans', label: get('property', 'nav', 'floorplans', 'Floor plans') }
      : null,
    hasMapPin
      ? { id: 'property-location', label: get('property', 'nav', 'location', 'Location') }
      : null,
    { id: 'property-enquire', label: get('property', 'nav', 'enquire', 'Enquire') },
  ].filter(Boolean)

  return (
    <>
      <Helmet>
        <title>{property.title} | United Properties</title>
      </Helmet>

      <section className="property-signature" aria-label="Property showcase">
        <div className="container property-signature__inner">
          <div className="property-signature__gallery">
            <Gallery
              images={property.gallery}
              title={property.title}
              brandLabel=""
              statusLabel={property.status}
            />
          </div>

          <div className="property-signature__meta">
            <div className="property-signature__meta-main">
              <h1 className="property-signature__title">{property.title}</h1>
              <p className="property-signature__location">
                <MapPin size={15} aria-hidden />
                <span>{property.location}</span>
              </p>
              <p
                className="property-signature__price"
                aria-label={`Price EUR ${property.price.toLocaleString()}${
                  property.status === 'For Rent' ? ' per month' : ''
                }`}
              >
                <span className="property-signature__price-currency">EUR</span>
                <span className="property-signature__price-figure">
                  {property.price.toLocaleString()}
                </span>
                {property.status === 'For Rent' ? (
                  <span className="property-signature__price-period">
                    {get('property', 'stats', 'price_period', '/ month')}
                  </span>
                ) : null}
              </p>
              <ul className="property-signature__facts" aria-label="Key facts">
                {hasStatValue(property.bedrooms) ? (
                  <li>
                    {property.bedrooms} {get('property', 'stats', 'label_bedrooms', 'Bedrooms')}
                  </li>
                ) : null}
                {hasStatValue(property.bathrooms) ? (
                  <li>
                    {property.bathrooms} {get('property', 'stats', 'label_bathrooms', 'Bathrooms')}
                  </li>
                ) : null}
                {hasStatValue(property.sqm) ? (
                  <li>
                    {property.sqm} {get('property', 'stats', 'label_sqm', 'sqm')}
                  </li>
                ) : null}
                {hasStatValue(property.plotSize) ? (
                  <li>
                    {property.plotSize} {get('property', 'stats', 'label_plot', 'sqm plot')}
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="property-signature__actions">
              <PropertyShareMenu
                property={property}
                whatsappLabel={get('property', 'actions', 'whatsapp_title', 'Chat on WhatsApp')}
                pdfLabel={get('property', 'actions', 'pdf_title', 'Download PDF')}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light property-details__main">
        <div className="container property-details">
          {property.brochureUrl ? (
            <div className="property-details__brochure">
              <a
                className="btn btn-outline-dark property-details__brochure-link"
                href={property.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={property.brochureFilename || undefined}
              >
                <FileDown size={18} strokeWidth={2.1} aria-hidden />
                <span>
                  {property.brochureFilename
                    ? `Download ${property.brochureFilename}`
                    : get('property', 'actions', 'brochure_fallback', 'Download brochure (PDF)')}
                </span>
              </a>
            </div>
          ) : null}

          {overviewStats.length ? (
            <div
              ref={overviewRef}
              id="property-overview"
              key={property.id}
              className="property-details__overview"
              style={{ '--overview-cols': String(Math.min(overviewStats.length, 6)) }}
              aria-label="Property key facts"
            >
              {overviewStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.id}
                    className={['property-details__stat', stat.className].filter(Boolean).join(' ')}
                  >
                    <span className="property-details__stat-icon" aria-hidden="true">
                      <Icon size={15} strokeWidth={1.9} />
                    </span>
                    <span className="property-details__stat-copy">
                      <AnimatedStatValue
                        value={stat.value}
                        active={overviewInView}
                        duration={stat.duration}
                      />
                      <span className="property-details__stat-label">{stat.label}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          ) : null}

          <nav
            ref={sectionNavRef}
            className="property-details__section-nav"
            aria-label="Property sections"
          >
            <div className="property-details__section-nav-track">
              {sectionLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className={`property-details__section-nav-link${
                    activeSection === link.id ? ' is-active' : ''
                  }`}
                  aria-current={activeSection === link.id ? 'true' : undefined}
                  onClick={() => {
                    setActiveSection(link.id)
                    scrollToPropertySection(link.id)
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="property-details__content-grid">
            <article
              id="property-description"
              className="property-details__description"
              aria-labelledby="property-description-title"
            >
              <header className="property-details__description-header">
                <span className="property-details__description-eyebrow">
                  <Sparkles size={14} strokeWidth={2.2} aria-hidden />
                  {get('property', 'description', 'eyebrow', 'Listing')}
                </span>
                <h3 id="property-description-title" className="property-details__description-title">
                  {get('property', 'description', 'heading', 'Description')}
                </h3>
              </header>

              <div
                id="property-description-body"
                className={`property-details__description-body ${descriptionExpanded ? 'is-expanded' : ''}`}
              >
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={`desc-${index}`}>{paragraph}</p>
                ))}
              </div>
              {property.description.length > DESCRIPTION_PREVIEW_CHARS ? (
                <button
                  type="button"
                  className="property-details__readmore"
                  onClick={() => setDescriptionExpanded((open) => !open)}
                  aria-expanded={descriptionExpanded}
                  aria-controls="property-description-body"
                >
                  {descriptionExpanded
                    ? get('property', 'description', 'show_less', 'Show less')
                    : get('property', 'description', 'read_more', 'Read full description')}
                </button>
              ) : null}

              {(attributeFacts.length > 0 || attributeMeta.length > 0) ? (
                <section
                  id="property-details"
                  className="property-details__attrs"
                  aria-labelledby="property-attributes-title"
                >
                  <div className="property-details__attrs-heading">
                    <span className="property-details__attrs-eyebrow">Specifications</span>
                    <h4 id="property-attributes-title" className="property-details__attrs-title">
                      Property details
                    </h4>
                  </div>

                  {attributeFacts.length > 0 ? (
                    <dl className="property-details__attrs-list">
                      {attributeFacts.map((row, index) => (
                        <div
                          key={row.label}
                          className="property-details__attrs-row"
                          style={{ '--attr-i': index }}
                        >
                          <dt className="property-details__attrs-label">{row.label}</dt>
                          <dd className="property-details__attrs-value">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {attributeMeta.length > 0 ? (
                    <div className="property-details__attrs-meta">
                      {attributeMeta.map((row) => (
                        <div key={row.label} className="property-details__attrs-meta-row">
                          <span className="property-details__attrs-meta-label">{row.label}</span>
                          <span className="property-details__attrs-meta-value">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {featureList.length > 0 ? (
                <section
                  id="property-amenities"
                  className="property-details__amenities-section"
                  aria-labelledby="amenities-heading"
                >
                  <h4 id="amenities-heading">
                    {get('property', 'description', 'amenities_heading', 'Amenities & features')}
                  </h4>
                  <ul className="property-details__amenities-list">
                    {featureList.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {hasFloorPlans ? (
                <section
                  id="property-floorplans"
                  className="property-details__floorplans"
                  aria-labelledby="floorplans-heading"
                >
                  <header className="property-details__floorplans-head">
                    <div className="property-details__floorplans-head-copy">
                      <span className="property-details__floorplans-eyebrow">
                        <LayoutTemplate size={14} strokeWidth={2.2} aria-hidden />
                        {get('property', 'floorplans', 'eyebrow', 'Layout')}
                      </span>
                      <h4 id="floorplans-heading">{floorplanHeading}</h4>
                      <p>
                        {get(
                          'property',
                          'floorplans',
                          'lede',
                          'Study the layout in detail — open any plan for a larger view.',
                        )}
                      </p>
                    </div>
                    <span className="property-details__floorplans-count">
                      {floorPlanImages.length}{' '}
                      {floorPlanImages.length === 1
                        ? get('property', 'floorplans', 'count_one', 'plan')
                        : get('property', 'floorplans', 'count_many', 'plans')}
                    </span>
                  </header>

                  <div className="property-details__floorplans-stage">
                    <button
                      type="button"
                      className="property-details__floorplans-viewer"
                      onClick={() => setFloorPlanLightboxOpen(true)}
                      aria-label={get(
                        'property',
                        'floorplans',
                        'open_label',
                        'Open floor plan full size',
                      )}
                    >
                      <img
                        src={activeFloorPlan}
                        alt={`${property.title} — ${floorplanHeading} ${floorPlanIndex + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="property-details__floorplans-zoom">
                        <ZoomIn size={16} strokeWidth={2.2} aria-hidden />
                        {get('property', 'floorplans', 'enlarge', 'Enlarge')}
                      </span>
                    </button>

                    {floorPlanImages.length > 1 ? (
                      <div className="property-details__floorplans-nav" role="group" aria-label="Floor plan navigation">
                        <button
                          type="button"
                          className="property-details__floorplans-nav-btn"
                          aria-label="Previous floor plan"
                          onClick={() =>
                            setFloorPlanIndex(
                              (i) => (i - 1 + floorPlanImages.length) % floorPlanImages.length,
                            )
                          }
                        >
                          <ChevronLeft size={18} strokeWidth={2.2} aria-hidden />
                        </button>
                        <span className="property-details__floorplans-nav-label">
                          {floorPlanIndex + 1} / {floorPlanImages.length}
                        </span>
                        <button
                          type="button"
                          className="property-details__floorplans-nav-btn"
                          aria-label="Next floor plan"
                          onClick={() =>
                            setFloorPlanIndex((i) => (i + 1) % floorPlanImages.length)
                          }
                        >
                          <ChevronRight size={18} strokeWidth={2.2} aria-hidden />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {floorPlanImages.length > 1 ? (
                    <div className="property-details__floorplans-thumbs" role="list">
                      {floorPlanImages.map((src, index) => (
                        <button
                          type="button"
                          role="listitem"
                          key={`${src}-${index}`}
                          className={`property-details__floorplans-thumb${
                            index === floorPlanIndex ? ' is-active' : ''
                          }`}
                          aria-label={`${floorplanHeading} ${index + 1}`}
                          aria-pressed={index === floorPlanIndex}
                          onClick={() => setFloorPlanIndex(index)}
                        >
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                          <span>Plan {index + 1}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {hasMapPin && mapLatitude != null && mapLongitude != null ? (
                <div id="property-location">
                  <PropertyLocationMap
                    latitude={mapLatitude}
                    longitude={mapLongitude}
                    title={property.title}
                    locationLabel={property.location || property.address || undefined}
                    heading={locationHeading}
                    zoom={mapZoom}
                    lede={get(
                      'property',
                      'location_map',
                      'lede',
                      mapCoords?.source === 'pin'
                        ? 'Exact pin from the listing — explore the neighbourhood on the map.'
                        : 'Location based on the listing area — open Google Maps for directions.',
                    )}
                  />
                </div>
              ) : null}

              {showInfoTiles ? (
                <div
                  className={`property-details__info-tiles${
                    !hasFloorPlans && !hasMapPin ? '' : ' property-details__info-tiles--single'
                  }`}
                >
                  {!hasFloorPlans ? (
                    <div
                      className="property-details__info-tile"
                      role="group"
                      aria-label={`${floorplanHeading} — available on request`}
                    >
                      <span className="property-details__info-tile-icon" aria-hidden="true">
                        <LayoutTemplate size={22} strokeWidth={2} />
                      </span>
                      <div className="property-details__info-tile-copy">
                        <h4>{floorplanHeading}</h4>
                        <p>
                          {get(
                            'property',
                            'info_tiles',
                            'floorplan_empty',
                            'Detailed layout available on request from our team.',
                          )}
                        </p>
                      </div>
                      <span className="property-details__info-tile-hint">
                        {get('property', 'info_tiles', 'floorplan_hint_request', 'Request')}
                      </span>
                    </div>
                  ) : null}
                  {!hasMapPin ? (
                    <div
                      className="property-details__info-tile"
                      role="group"
                      aria-label={`${locationHeading} — available on request`}
                    >
                      <span className="property-details__info-tile-icon" aria-hidden="true">
                        <MapIcon size={22} strokeWidth={2} />
                      </span>
                      <div className="property-details__info-tile-copy">
                        <h4>{locationHeading}</h4>
                        <p>
                          {get(
                            'property',
                            'info_tiles',
                            'location_on_request',
                            'Map and neighbourhood details available on request from our team.',
                          )}
                        </p>
                      </div>
                      <span className="property-details__info-tile-hint">
                        {get('property', 'info_tiles', 'location_hint_request', 'Request')}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {floorPlanLightboxOpen && activeFloorPlan ? (
                <div
                  className="property-details__floorplan-lightbox"
                  role="dialog"
                  aria-modal="true"
                  aria-label={floorplanHeading}
                  onClick={() => setFloorPlanLightboxOpen(false)}
                >
                  <div
                    className="property-details__floorplan-lightbox-panel"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="property-details__floorplan-lightbox-toolbar">
                      <p>
                        {floorplanHeading}
                        {floorPlanImages.length > 1
                          ? ` · ${floorPlanIndex + 1} / ${floorPlanImages.length}`
                          : ''}
                      </p>
                      <button
                        type="button"
                        className="property-details__floorplan-lightbox-close"
                        aria-label="Close floor plan"
                        onClick={() => setFloorPlanLightboxOpen(false)}
                      >
                        <X size={20} strokeWidth={2.2} aria-hidden />
                      </button>
                    </div>
                    <div className="property-details__floorplan-lightbox-stage">
                      {floorPlanImages.length > 1 ? (
                        <button
                          type="button"
                          className="property-details__floorplan-lightbox-nav property-details__floorplan-lightbox-nav--prev"
                          aria-label="Previous floor plan"
                          onClick={() =>
                            setFloorPlanIndex(
                              (i) => (i - 1 + floorPlanImages.length) % floorPlanImages.length,
                            )
                          }
                        >
                          <ChevronLeft size={22} strokeWidth={2.2} aria-hidden />
                        </button>
                      ) : null}
                      <img
                        src={activeFloorPlan}
                        alt={`${property.title} — ${floorplanHeading} ${floorPlanIndex + 1}`}
                      />
                      {floorPlanImages.length > 1 ? (
                        <button
                          type="button"
                          className="property-details__floorplan-lightbox-nav property-details__floorplan-lightbox-nav--next"
                          aria-label="Next floor plan"
                          onClick={() =>
                            setFloorPlanIndex((i) => (i + 1) % floorPlanImages.length)
                          }
                        >
                          <ChevronRight size={22} strokeWidth={2.2} aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </article>

            <aside id="property-enquire" className="property-details__sidebar">
              {agent && (
                <article className="card-luxury property-details__agent">
                  <div className="property-details__agent-head">
                    <span className="property-details__agent-eyebrow">
                      <UserRound size={14} aria-hidden />
                      {get('property', 'agent', 'eyebrow', 'Your property consultant')}
                    </span>
                  </div>

                  <div className="property-details__agent-media">
                    <img src={agent.image} alt={agent.name} loading="lazy" />
                  </div>

                  <div className="property-details__agent-body">
                    <h4 className="property-details__agent-name">{agent.name}</h4>
                    <p className="property-details__agent-role">{agent.role}</p>
                    {agent.specialization ? (
                      <p className="property-details__agent-spec">{agent.specialization}</p>
                    ) : null}

                    <div className="property-details__agent-contacts">
                      {agent.phone ? (
                        <a
                          className="property-details__agent-contact"
                          href={`tel:${agent.phone.replace(/\s/g, '')}`}
                        >
                          <Phone size={16} aria-hidden />
                          <span>{agent.phone}</span>
                        </a>
                      ) : null}
                      {agent.email ? (
                        <a
                          className="property-details__agent-contact"
                          href={`mailto:${agent.email}?subject=${encodeURIComponent(
                            `Enquiry: ${property.title}`,
                          )}`}
                        >
                          <Mail size={16} aria-hidden />
                          <span>{agent.email}</span>
                        </a>
                      ) : null}
                    </div>

                    <Link to="/agents" className="property-details__agent-cta">
                      {get('property', 'agent', 'profile_cta', 'View agent profile')}
                      <ArrowUpRight size={17} aria-hidden />
                    </Link>
                  </div>
                </article>
              )}
              <InquiryForm
                propertyId={typeof property.id === 'string' ? property.id : null}
                propertyInterestDefault={property.title}
              />
            </aside>
          </div>
        </div>
      </section>

      <section className="section section--light property-details__similar-section">
        <div className="container property-details__similar">
          <div className="property-details__similar-heading">
            <div className="property-details__similar-heading__main">
              <div className="property-details__similar-heading__copy">
                <SectionHeader
                  className="property-details__similar-header"
                  eyebrow={get('property', 'similar', 'eyebrow', 'Curated for you')}
                  title={get('property', 'similar', 'heading', 'Similar Properties')}
                  description={get(
                    'property',
                    'similar',
                    'description',
                    'More listings that fit this home—matched by area, status, or price band.',
                  )}
                />
              </div>
            </div>
            <Link className="property-details__similar-viewall" to="/buy">
              {get('property', 'similar', 'view_all', 'View all in Limassol')}
              <ChevronRight size={17} strokeWidth={2.1} aria-hidden />
            </Link>
          </div>
          <ul className="property-details__similar-match-hints" aria-label="Matching criteria">
            <li>{get('property', 'similar', 'hint_area', 'Area & district')}</li>
            <li>{get('property', 'similar', 'hint_status', 'Status')}</li>
            <li>{get('property', 'similar', 'hint_price', 'Price band')}</li>
          </ul>
          {similarProperties.length > 0 ? (
            <div className="grid-3 property-details__similar-grid">
              {similarProperties.map((item) => (
                <PropertyCard key={item.id} property={item} variant="cover" />
              ))}
            </div>
          ) : (
            <p className="property-details__similar-empty">
              <Link to="/buy">
                {get('property', 'similar', 'empty_prefix', 'Browse all properties')}
              </Link>
              {get('property', 'similar', 'empty_suffix', ' to discover more listings.')}
            </p>
          )}
        </div>
      </section>
    </>
  )
}

export default PropertyDetails
