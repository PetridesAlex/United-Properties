import { useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import {
  BedDouble,
  Bath,
  Ruler,
  CalendarClock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import Gallery from '../components/Gallery/Gallery'
import OptimizedImage from '../components/OptimizedImage/OptimizedImage'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import PropertyLocationMap from '../components/PropertyDetails/PropertyLocationMap'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { useSiteContent } from '../hooks/useSiteContent'
import { buildPublicPropertyAttributes } from '../lib/properties/publicAttributes'
import { fetchPublishedPropertyBySlug } from '../lib/properties/api'
import { mapPropertyToPublicCard } from '../lib/properties/mappers'
import { resolvePropertyCoordinates } from '../lib/properties/mapCoords'
import PropertyShare from '../components/PropertyDetails/PropertyShare'
import PrivateConsultation from '../components/PropertyDetails/PrivateConsultation'
import './PropertyPage.css'

const SIMILAR_MAX = 3

const PROPERTY_SECTION_IDS = [
  'property-overview',
  'property-description',
  'property-details',
  'property-floorplans',
  'property-location',
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
  const fromList = useMemo(
    () => allProperties.find((item) => item.slug === slug),
    [allProperties, slug],
  )
  const [directProperty, setDirectProperty] = useState(null)
  const [directSettled, setDirectSettled] = useState(false)
  const [floorPlanIndex, setFloorPlanIndex] = useState(0)
  const [floorPlanLightboxOpen, setFloorPlanLightboxOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('property-description')
  const sectionNavRef = useRef(null)

  const property = fromList || (directProperty?.slug === slug ? directProperty : null)

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
    if (!slug || fromList) return undefined
    let cancelled = false
    setDirectSettled(false)
    fetchPublishedPropertyBySlug(slug)
      .then((row) => {
        if (cancelled) return
        setDirectProperty(row ? mapPropertyToPublicCard(row) : null)
        setDirectSettled(true)
      })
      .catch(() => {
        if (!cancelled) setDirectSettled(true)
      })
    return () => {
      cancelled = true
    }
  }, [slug, fromList])

  useEffect(() => {
    if (property?.title) {
      document.title = `${property.title} | United Properties`
      return
    }
    if (!loading && directSettled) {
      document.title = 'Property not found | United Properties'
    }
  }, [property?.title, loading, directSettled])

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
  }, [property?.id, property?.description, property?.showLocationMap, floorPlanImages.length])

  useEffect(() => {
    const track = sectionNavRef.current
    if (!track) return
    const active = track.querySelector('.pp-tabs__link.is-on')
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
    if (loading || !directSettled) {
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

  const AIR_LABELS = { 1: 'Full, all rooms', 2: 'Partly', 3: 'No' }
  const PARKING_LABELS = { 1: 'Covered', 2: 'Uncovered', 3: 'No' }
  const { facts: attributeFacts } = buildPublicPropertyAttributes(property)
  const includedRow = attributeFacts.find((row) => row.label === 'Included')
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
  const hasMapPin = Boolean(property.showLocationMap) && Boolean(mapCoords)
  const mapZoom = mapCoords?.source === 'city' ? 12 : mapCoords?.source === 'pin' ? 15 : 14
  const isRent = property.status === 'For Rent'
  const reference = String(property.referenceId || '').trim()
  const cityName = String(property.location || '').split(',').pop().trim() || 'Limassol'

  const sqmText = (n) => `${Number(n).toLocaleString('en-US')} sqm`

  // Facts strip: four equal cells, empty ones drop out
  const facts = [
    hasStatValue(property.sqm) && Number(property.sqm) > 0
      ? { id: 'area', icon: Ruler, value: Number(property.sqm).toLocaleString('en-US'), unit: ' sqm', label: 'TOTAL PRIVATE AREA' }
      : null,
    hasStatValue(property.bedrooms) && Number(property.bedrooms) > 0
      ? { id: 'beds', icon: BedDouble, value: property.bedrooms, label: 'BEDROOMS' }
      : null,
    hasStatValue(property.bathrooms) && Number(property.bathrooms) > 0
      ? { id: 'baths', icon: Bath, value: property.bathrooms, label: 'BATHROOMS' }
      : null,
    hasStatValue(property.yearBuilt) ? { id: 'built', icon: CalendarClock, value: property.yearBuilt, label: 'BUILT IN' } : null,
  ].filter(Boolean)

  // Specifications: every field only when filled in the CMS ("Online viewing" is never shown)
  const wideSpecs = [
    property.type?.trim() ? { k: 'TYPE', v: property.type.trim() } : null,
    property.furnishing?.trim() ? { k: 'FURNISHING', v: property.furnishing.trim() } : null,
  ].filter(Boolean)
  const specs = [
    Number(property.sqm) > 0 ? { k: 'TOTAL PRIVATE AREA', v: sqmText(property.sqm) } : null,
    Number(property.coveredArea) > 0 ? { k: 'INTERNAL COVERED AREA', v: sqmText(property.coveredArea) } : null,
    Number(property.plotSize) > 0 ? { k: 'PLOT AREA', v: sqmText(property.plotSize) } : null,
    Number(property.bedrooms) > 0 ? { k: 'BEDROOMS', v: String(property.bedrooms) } : null,
    Number(property.bathrooms) > 0 ? { k: 'BATHROOMS', v: String(property.bathrooms) } : null,
    property.parkingType != null && PARKING_LABELS[property.parkingType]
      ? { k: 'PARKING', v: PARKING_LABELS[property.parkingType] }
      : Number(property.parking) > 0
        ? { k: 'PARKING', v: `${property.parking} space${Number(property.parking) === 1 ? '' : 's'}` }
        : null,
    property.airConditioning != null && AIR_LABELS[property.airConditioning]
      ? { k: 'AIR CONDITIONING', v: AIR_LABELS[property.airConditioning] }
      : null,
    property.floor != null && property.floor !== ''
      ? { k: 'FLOOR', v: Number(property.floor) === 0 ? 'Ground' : String(property.floor) }
      : null,
    property.energyEfficiency?.trim() ? { k: 'ENERGY EFFICIENCY', v: property.energyEfficiency.trim() } : null,
    property.condition?.trim() ? { k: 'CONDITION', v: property.condition.trim() } : null,
    hasStatValue(property.yearBuilt) ? { k: 'CONSTRUCTION YEAR', v: String(property.yearBuilt) } : null,
    includedRow ? { k: 'INCLUDED', v: includedRow.value } : null,
    property.postalCode?.trim() ? { k: 'POSTAL CODE', v: property.postalCode.trim() } : null,
  ].filter(Boolean)
  const hasSpecs = wideSpecs.length > 0 || specs.length > 0 || Boolean(reference)

  const sectionLinks = [
    facts.length ? { id: 'property-overview', label: 'OVERVIEW' } : null,
    { id: 'property-description', label: 'DESCRIPTION' },
    hasSpecs ? { id: 'property-details', label: 'SPECIFICATIONS' } : null,
    hasFloorPlans ? { id: 'property-floorplans', label: 'LAYOUT' } : null,
    hasMapPin ? { id: 'property-location', label: 'LOCATION' } : null,
    { id: 'property-enquire', label: 'ENQUIRE' },
  ].filter(Boolean)

  const backTo = isRent ? '/rent' : '/buy'

  return (
    <>
      <Helmet>
        <title>{property.title} | United Properties</title>
        {property.seoDescription ? <meta name="description" content={property.seoDescription} /> : null}
      </Helmet>

      <div className="up-pp">
        <section className="pp-hero" aria-label="Property showcase">
          <div className="pp-wrap pp-hero__inner">
            <Link to={backTo} className="pp-back">
              &larr; Back to listings
            </Link>

            <div className="pp-gal">
              <Gallery images={property.gallery} title={property.title} brandLabel="" statusLabel="" />
            </div>

            <div className="pp-tb">
              <h1 className="pp-title">{property.title}</h1>
              <p className="pp-place">
                <MapPin size={18} strokeWidth={1.6} aria-hidden />
                <span>{property.location}</span>
              </p>
              <div className="pp-prr">
                <p
                  className="pp-price"
                  aria-label={`Price EUR ${Number(property.price).toLocaleString('en-US')}${isRent ? ' per month' : ''}`}
                >
                  <small>EUR</small>
                  <b>{Number(property.price).toLocaleString('en-US')}</b>
                  {isRent ? <em>/ month</em> : null}
                </p>
                <PropertyShare property={property} />
              </div>
            </div>
          </div>
        </section>

        <section className="pp-main">
          <div className="pp-wrap pp-main__inner">
            {facts.length ? (
              <div
                id="property-overview"
                className="pp-facts"
                style={{ '--pp-facts': String(facts.length) }}
                aria-label="Key facts"
              >
                {facts.map((f) => {
                  const Icon = f.icon
                  return (
                    <div key={f.id} className="pp-fact">
                      <span className="pp-fact__icon" aria-hidden>
                        <Icon size={20} strokeWidth={1.5} />
                      </span>
                      <div>
                        <b>
                          {f.value}
                          {f.unit ? <em>{f.unit}</em> : null}
                        </b>
                        <i>{f.label}</i>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}

            <nav ref={sectionNavRef} className="pp-tabs" aria-label="Property sections">
              {sectionLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className={`pp-tabs__link${activeSection === link.id ? ' is-on' : ''}`}
                  aria-current={activeSection === link.id ? 'true' : undefined}
                  onClick={() => {
                    setActiveSection(link.id)
                    scrollToPropertySection(link.id)
                  }}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="pp-cols">
              <div className="pp-stack">
                <h2 className="pp-ptt">Property details</h2>

                <article id="property-description" className="pp-card">
                  <span className="eb">DESCRIPTION</span>
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p key={`desc-${index}`} className="pp-dx">
                      {paragraph}
                    </p>
                  ))}
                </article>

                {hasSpecs ? (
                  <article id="property-details" className="pp-card">
                    <span className="eb">SPECIFICATIONS</span>
                    {wideSpecs.length || specs.length ? (
                      <div className="pp-sg">
                        {wideSpecs.map((row) => (
                          <div key={row.k} className="pp-spw">
                            <span className="pp-sk">{row.k}</span>
                            <span className="pp-sv">{row.v}</span>
                          </div>
                        ))}
                        {specs.map((row) => (
                          <div key={row.k} className="pp-spc">
                            <span className="pp-sk">{row.k}</span>
                            <span className="pp-sv">{row.v}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {reference ? (
                      <div className="pp-refl">
                        <span>REFERENCE NUMBER</span>
                        <b>{reference}</b>
                      </div>
                    ) : null}
                  </article>
                ) : null}

                {hasFloorPlans ? (
                  <article id="property-floorplans" className="pp-card">
                    <div className="pp-cardhead">
                      <span className="eb">LAYOUT</span>
                      <span className="pp-chip">
                        <span className="pp-dg">{floorPlanImages.length}</span>{' '}
                        {floorPlanImages.length === 1 ? 'PLAN' : 'PLANS'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="pp-plbig"
                      onClick={() => setFloorPlanLightboxOpen(true)}
                      aria-label="Open floor plan full size"
                    >
                      <OptimizedImage
                        src={activeFloorPlan}
                        alt={`${property.title}, plan ${floorPlanIndex + 1}`}
                        preset="lightbox"
                        loading="lazy"
                        sizes="(max-width: 1000px) 92vw, 720px"
                      />
                      <span className="pp-enl">ENLARGE</span>
                      {floorPlanImages.length > 1 ? (
                        <span className="pp-cn">
                          <span className="pp-dg">{floorPlanIndex + 1}</span> /{' '}
                          <span className="pp-dg">{floorPlanImages.length}</span>
                        </span>
                      ) : null}
                    </button>
                    {floorPlanImages.length > 1 ? (
                      <div className="pp-plth">
                        {floorPlanImages.map((src, index) => (
                          <button
                            type="button"
                            key={`${src}-${index}`}
                            className={index === floorPlanIndex ? 'is-on' : ''}
                            aria-pressed={index === floorPlanIndex}
                            onClick={() => setFloorPlanIndex(index)}
                          >
                            <OptimizedImage src={src} alt="" preset="lightboxThumb" loading="lazy" sizes="140px" />
                            <b>
                              PLAN <span className="pp-dg">{index + 1}</span>
                            </b>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ) : null}

                {hasMapPin ? (
                  <article id="property-location" className="pp-card">
                    <span className="eb">LOCATION</span>
                    <PropertyLocationMap
                      latitude={mapCoords.latitude}
                      longitude={mapCoords.longitude}
                      title={property.title}
                      locationLabel={property.location || property.address || undefined}
                      heading=""
                      zoom={mapZoom}
                      lede=""
                    />
                  </article>
                ) : null}
              </div>

              <aside id="property-enquire" className="pp-enq">
                <PrivateConsultation
                  propertyId={typeof property.id === 'string' ? property.id : null}
                  propertyTitle={property.title}
                  reference={reference}
                />
                <div className="pp-story">
                  <span className="pp-ceb">UNITED PROPERTIES</span>
                  <h2>What is your story?</h2>
                  <span className="sty">A few personal questions help us begin the right way.</span>
                  <Link className="pp-btn pp-btn--glow" to="/contact">
                    Answer a few questions
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {similarProperties.length > 0 ? (
          <section className="pp-similar">
            <div className="pp-wrap">
              <div className="pp-similar__head">
                <span className="eb">SIMILAR PROPERTIES</span>
                <Link className="pp-btn pp-btn--cream" to={isRent ? '/rent' : '/buy'}>
                  View all in {cityName}
                </Link>
              </div>
              <div className="pp-grid3">
                {similarProperties.map((item) => (
                  <PropertyCard
                    key={item.id}
                    property={item}
                    imageSizes="(max-width: 760px) 94vw, (max-width: 1100px) 46vw, 32vw"
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {floorPlanLightboxOpen && activeFloorPlan ? (
          <div
            className="pp-plview"
            role="dialog"
            aria-modal="true"
            aria-label="Floor plan"
            onClick={() => setFloorPlanLightboxOpen(false)}
          >
            <p className="pp-plview__title">{property.title}</p>
            <button
              type="button"
              className="pp-ring pp-ring--close"
              aria-label="Close floor plan"
              onClick={() => setFloorPlanLightboxOpen(false)}
            >
              <X size={17} strokeWidth={1.4} aria-hidden />
            </button>
            <div className="pp-plview__stage" onClick={(e) => e.stopPropagation()}>
              {floorPlanImages.length > 1 ? (
                <button
                  type="button"
                  className="pp-ring pp-ring--nav"
                  aria-label="Previous floor plan"
                  onClick={() =>
                    setFloorPlanIndex((i) => (i - 1 + floorPlanImages.length) % floorPlanImages.length)
                  }
                >
                  <ChevronLeft size={17} strokeWidth={1.4} aria-hidden />
                </button>
              ) : null}
              <OptimizedImage
                src={activeFloorPlan}
                alt={`${property.title}, plan ${floorPlanIndex + 1}`}
                preset="lightbox"
                loading="eager"
                sizes="92vw"
              />
              {floorPlanImages.length > 1 ? (
                <button
                  type="button"
                  className="pp-ring pp-ring--nav"
                  aria-label="Next floor plan"
                  onClick={() => setFloorPlanIndex((i) => (i + 1) % floorPlanImages.length)}
                >
                  <ChevronRight size={17} strokeWidth={1.4} aria-hidden />
                </button>
              ) : null}
            </div>
            {floorPlanImages.length > 1 ? (
              <p className="pp-plview__count">
                {floorPlanIndex + 1} / {floorPlanImages.length}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  )
}

export default PropertyDetails
