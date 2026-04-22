import { useMemo, useState } from 'react'
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
  ChevronRight,
  LayoutTemplate,
  Map,
  Sparkles,
  FileDown,
} from 'lucide-react'
import { WhatsAppBrandIcon } from '../components/Navbar/SocialBrandIcons'
import Gallery from '../components/Gallery/Gallery'
import InquiryForm from '../components/InquiryForm/InquiryForm'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import { agents } from '../data/agents'
import { useMergedProperties } from '../hooks/useMergedProperties'
import './Properties.css'
import './PropertyDetails.css'

const DESCRIPTION_PREVIEW_CHARS = 280
const SIMILAR_MAX = 3

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
  const { list: allProperties, loading } = useMergedProperties()
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const property = useMemo(
    () => allProperties.find((item) => item.slug === slug),
    [allProperties, slug],
  )

  const agent = property ? agents.find((item) => item.id === property.agentId) : null

  const similarProperties = useMemo(
    () => (property ? pickSimilarProperties(allProperties, property) : []),
    [allProperties, property],
  )

  if (!property) {
    if (loading) {
      return (
        <>
          <Helmet>
            <title>Loading… | United Properties</title>
          </Helmet>
          <section className="section section--light">
            <div className="container">
              <p className="property-details__loading">Loading property…</p>
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
            <h1>Property not found</h1>
            <p>This listing may have been removed or the link is incorrect.</p>
            <Link to="/buy" className="btn btn-gold">
              Browse properties
            </Link>
          </div>
        </section>
      </>
    )
  }

  const featureList = Array.isArray(property.features) ? property.features : []

  return (
    <>
      <Helmet>
        <title>{property.title} | United Properties</title>
      </Helmet>

      <section
        className={`page-hero page-hero--property properties-hero ${
          property.status === 'For Rent' ? 'properties-hero--rent' : 'properties-hero--buy'
        }`.trim()}
      >
        <div className="container property-details__hero-inner">
          <p className="property-details__hero-eyebrow">
            <span>{property.status}</span>
            {property.type ? (
              <>
                <span className="property-details__hero-eyebrow-sep" aria-hidden="true" />
                <span>{property.type}</span>
              </>
            ) : null}
          </p>
          <h1 className="property-details__hero-title">{property.title}</h1>
          <p className="property-details__hero-location">
            <MapPin size={16} aria-hidden /> {property.location}
          </p>
        </div>
      </section>

      <section className="section section--light property-details__main">
        <div className="property-details__gallery-fullbleed">
          <Gallery images={property.gallery} title={property.title} />
        </div>
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
                    : 'Download brochure (PDF)'}
                </span>
              </a>
            </div>
          ) : null}

          <div className="property-details__head">
            <div className="property-details__head-row">
              <div className="property-details__head-primary">
                <p className="property-details__status">{property.status}</p>
                <h2
                  className="property-details__price"
                  aria-label={`Price EUR ${property.price.toLocaleString()}${
                    property.status === 'For Rent' ? ' per month' : ''
                  }`}
                >
                  <span className="property-details__price-inner">
                    <span className="property-details__price-currency">EUR</span>
                    <span className="property-details__price-figure">
                      {property.price.toLocaleString()}
                    </span>
                    {property.status === 'For Rent' ? (
                      <span className="property-details__price-period">/ month</span>
                    ) : null}
                  </span>
                </h2>
              </div>
              <a
                className="btn btn-gold property-details__whatsapp"
                href="https://wa.me/35700000000"
                target="_blank"
                rel="noreferrer"
              >
                <span className="property-details__whatsapp-iconWrap" aria-hidden="true">
                  <WhatsAppBrandIcon size={18} className="property-details__whatsapp-brandIcon" />
                </span>
                <span className="property-details__whatsapp-text">
                  <span className="property-details__whatsapp-title">Chat on WhatsApp</span>
                  <span className="property-details__whatsapp-sub">FAST REPLY · SAME DAY</span>
                </span>
                <ChevronRight className="property-details__whatsapp-chevron" size={20} strokeWidth={2.25} aria-hidden />
              </a>
            </div>
            <p className="property-details__summary">{property.description}</p>
          </div>

          <div className="property-details__overview">
            <span className="property-details__stat">
              <BedDouble size={16} /> {property.bedrooms} Bedrooms
            </span>
            <span className="property-details__stat property-details__stat--bath">
              <Bath size={16} /> {property.bathrooms} Bathrooms
            </span>
            <span className="property-details__stat">
              <Ruler size={16} /> {property.sqm} sqm internal area
            </span>
            <span className="property-details__stat">
              <LandPlot size={16} /> {property.plotSize || 'N/A'} sqm plot size
            </span>
            <span className="property-details__stat">
              <Car size={16} /> {property.parking} Parking
            </span>
            <span className="property-details__stat">
              <CalendarClock size={16} /> Built in {property.yearBuilt}
            </span>
          </div>

          <div className="property-details__content-grid">
            <article className="property-details__description" aria-labelledby="property-description-title">
              <header className="property-details__description-header">
                <span className="property-details__description-eyebrow">
                  <Sparkles size={14} strokeWidth={2.2} aria-hidden />
                  Listing
                </span>
                <h3 id="property-description-title" className="property-details__description-title">
                  Description
                </h3>
              </header>

              <div
                id="property-description-body"
                className={`property-details__description-body ${descriptionExpanded ? 'is-expanded' : ''}`}
              >
                <p>{property.description}</p>
              </div>
              {property.description.length > DESCRIPTION_PREVIEW_CHARS ? (
                <button
                  type="button"
                  className="property-details__readmore"
                  onClick={() => setDescriptionExpanded((open) => !open)}
                  aria-expanded={descriptionExpanded}
                  aria-controls="property-description-body"
                >
                  {descriptionExpanded ? 'Show less' : 'Read full description'}
                </button>
              ) : null}

              {featureList.length > 0 ? (
                <section
                  className="property-details__amenities-section"
                  aria-labelledby="amenities-heading"
                >
                  <h4 id="amenities-heading">Amenities &amp; features</h4>
                  <ul className="property-details__amenities-list">
                    {featureList.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="property-details__info-tiles">
                <div
                  className={`property-details__info-tile ${property.floorPlanUrl ? 'property-details__info-tile--has-plan' : ''}`}
                  role="group"
                  aria-label={property.floorPlanUrl ? 'Floor plan' : 'Floor plan — available on request'}
                >
                  <span className="property-details__info-tile-icon" aria-hidden="true">
                    <LayoutTemplate size={22} strokeWidth={2} />
                  </span>
                  <div className="property-details__info-tile-copy">
                    <h4>Floor plan</h4>
                    {property.floorPlanUrl ? (
                      <div className="property-details__floorplan-thumbWrap">
                        <img
                          className="property-details__floorplan-thumb"
                          src={property.floorPlanUrl}
                          alt={`${property.title} — floor plan`}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <p>Detailed layout available on request from our team.</p>
                    )}
                  </div>
                  <span className="property-details__info-tile-hint">
                    {property.floorPlanUrl ? 'Listing' : 'Request'}
                  </span>
                </div>
                <div
                  className="property-details__info-tile"
                  role="group"
                  aria-label="Location map — coming soon"
                >
                  <span className="property-details__info-tile-icon" aria-hidden="true">
                    <Map size={22} strokeWidth={2} />
                  </span>
                  <div className="property-details__info-tile-copy">
                    <h4>Location</h4>
                    <p>Map and neighbourhood context — integration in progress.</p>
                  </div>
                  <span className="property-details__info-tile-hint">Soon</span>
                </div>
              </div>
            </article>

            <aside className="property-details__sidebar">
              {agent && (
                <article className="card-luxury property-details__agent">
                  <img src={agent.image} alt={agent.name} />
                  <h4>{agent.name}</h4>
                  <p>{agent.role}</p>
                  <Link to="/agents" className="btn btn-outline-dark">
                    View Agent Profile
                  </Link>
                </article>
              )}
              <InquiryForm />
            </aside>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container property-details__similar">
          <div className="property-details__similar-heading">
            <span className="property-details__similar-heading__accent" aria-hidden="true" />
            <div className="property-details__similar-heading__main">
              <span className="property-details__similar-heading__icon" aria-hidden="true">
                <Sparkles size={22} strokeWidth={2} />
              </span>
              <div className="property-details__similar-heading__copy">
                <SectionHeader
                  className="property-details__similar-header"
                  eyebrow="Curated for you"
                  title="Similar Properties"
                  description="More listings that fit this home—matched by area, status, or price band. Open any card for the full story."
                />
              </div>
            </div>
            <Link className="property-details__similar-viewall" to="/buy">
              View all in Limassol
              <ChevronRight size={17} strokeWidth={2.1} aria-hidden />
            </Link>
          </div>
          <ul className="property-details__similar-match-hints" aria-label="Matching criteria">
            <li>Area &amp; district</li>
            <li>Status</li>
            <li>Price band</li>
          </ul>
          {similarProperties.length > 0 ? (
            <div className="grid-3 property-details__similar-grid">
              {similarProperties.map((item) => (
                <PropertyCard key={item.id} property={item} variant="cover" />
              ))}
            </div>
          ) : (
            <p className="property-details__similar-empty">
              <Link to="/buy">Browse all properties</Link> to discover more listings.
            </p>
          )}
        </div>
      </section>
    </>
  )
}

export default PropertyDetails
