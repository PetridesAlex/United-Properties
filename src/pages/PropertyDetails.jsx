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
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
  FileDown,
  UserRound,
} from 'lucide-react'
import { WhatsAppBrandIcon } from '../components/Navbar/SocialBrandIcons'
import Gallery from '../components/Gallery/Gallery'
import InquiryForm from '../components/InquiryForm/InquiryForm'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import AnimatedStatValue from '../components/PropertyDetails/AnimatedStatValue'
import { agents } from '../data/agents'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { useSiteContent } from '../hooks/useSiteContent'
import { useInViewOnce } from '../hooks/useCountUp'
import { buildPublicPropertyAttributes } from '../lib/properties/publicAttributes'
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
  const { get } = useSiteContent()
  const { list: allProperties, loading } = useMergedProperties()
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [overviewRef, overviewInView] = useInViewOnce()

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
          <div className="property-details__hero-meta" aria-label="Listing details">
            <span
              className={`property-details__hero-badge property-details__hero-badge--status property-details__hero-badge--${
                property.status === 'For Rent'
                  ? 'rent'
                  : property.status === 'Sold'
                    ? 'sold'
                    : property.status === 'Reserved'
                      ? 'reserved'
                      : 'sale'
              }`}
            >
              {property.status}
            </span>
            {property.type ? (
              <span className="property-details__hero-badge property-details__hero-badge--type">
                {property.type}
              </span>
            ) : null}
          </div>
          <h1 className="property-details__hero-title">{property.title}</h1>
          <p className="property-details__hero-location">
            <MapPin size={16} aria-hidden /> {property.location}
          </p>
        </div>
      </section>

      <section className="section section--light property-details__main">
        <div className="container property-details">
          <div className="property-details__gallery">
            <Gallery images={property.gallery} title={property.title} />
          </div>
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

          <div className="property-details__head">
            <div className="property-details__head-row">
              <div className="property-details__head-primary">
                <p
                  className={`property-details__status property-details__status--${
                    property.status === 'For Rent'
                      ? 'rent'
                      : property.status === 'Sold' || property.status === 'Rented'
                        ? 'sold'
                        : property.status === 'Reserved'
                          ? 'reserved'
                          : 'sale'
                  }`}
                >
                  {property.status}
                </p>
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
                      <span className="property-details__price-period">
                        {get('property', 'stats', 'price_period', '/ month')}
                      </span>
                    ) : null}
                  </span>
                </h2>
              </div>
              <a
                className="property-details__whatsapp"
                href="https://wa.me/35700000000"
                target="_blank"
                rel="noreferrer"
                aria-label={get('property', 'actions', 'whatsapp_title', 'Chat on WhatsApp')}
              >
                <span className="property-details__whatsapp-iconWrap" aria-hidden="true">
                  <span className="property-details__whatsapp-pulse" />
                  <WhatsAppBrandIcon size={20} className="property-details__whatsapp-brandIcon" />
                </span>
                <span className="property-details__whatsapp-title">
                  <span className="property-details__whatsapp-title-text">
                    {get('property', 'actions', 'whatsapp_title', 'Chat on WhatsApp')}
                  </span>
                  <span className="property-details__whatsapp-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </span>
              </a>
            </div>
          </div>

          <div
            ref={overviewRef}
            key={property.id}
            className="property-details__overview"
            aria-label="Property key facts"
          >
            <div className="property-details__stat">
              <span className="property-details__stat-icon" aria-hidden="true">
                <BedDouble size={22} strokeWidth={1.85} />
              </span>
              <span className="property-details__stat-copy">
                <AnimatedStatValue value={property.bedrooms} active={overviewInView} duration={900} />
                <span className="property-details__stat-label">
                  {get('property', 'stats', 'label_bedrooms', 'Bedrooms')}
                </span>
              </span>
            </div>
            <div className="property-details__stat property-details__stat--bath">
              <span className="property-details__stat-icon" aria-hidden="true">
                <Bath size={22} strokeWidth={1.85} />
              </span>
              <span className="property-details__stat-copy">
                <AnimatedStatValue value={property.bathrooms} active={overviewInView} duration={950} />
                <span className="property-details__stat-label">
                  {get('property', 'stats', 'label_bathrooms', 'Bathrooms')}
                </span>
              </span>
            </div>
            <div className="property-details__stat">
              <span className="property-details__stat-icon" aria-hidden="true">
                <Ruler size={22} strokeWidth={1.85} />
              </span>
              <span className="property-details__stat-copy">
                <AnimatedStatValue value={property.sqm} active={overviewInView} duration={1200} />
                <span className="property-details__stat-label">
                  {get('property', 'stats', 'label_sqm', 'sqm internal area')}
                </span>
              </span>
            </div>
            <div className="property-details__stat">
              <span className="property-details__stat-icon" aria-hidden="true">
                <LandPlot size={22} strokeWidth={1.85} />
              </span>
              <span className="property-details__stat-copy">
                <AnimatedStatValue
                  value={property.plotSize || 'N/A'}
                  active={overviewInView}
                  duration={1200}
                />
                <span className="property-details__stat-label">
                  {get('property', 'stats', 'label_plot', 'sqm plot size')}
                </span>
              </span>
            </div>
            <div className="property-details__stat">
              <span className="property-details__stat-icon" aria-hidden="true">
                <Car size={22} strokeWidth={1.85} />
              </span>
              <span className="property-details__stat-copy">
                <AnimatedStatValue value={property.parking} active={overviewInView} duration={1000} />
                <span className="property-details__stat-label">
                  {get('property', 'stats', 'label_parking', 'Parking')}
                </span>
              </span>
            </div>
            <div className="property-details__stat">
              <span className="property-details__stat-icon" aria-hidden="true">
                <CalendarClock size={22} strokeWidth={1.85} />
              </span>
              <span className="property-details__stat-copy">
                <AnimatedStatValue value={property.yearBuilt} active={overviewInView} duration={1400} />
                <span className="property-details__stat-label">
                  {get('property', 'stats', 'label_built', 'Built in')}
                </span>
              </span>
            </div>
          </div>

          <div className="property-details__content-grid">
            <article className="property-details__description" aria-labelledby="property-description-title">
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
                  {descriptionExpanded
                    ? get('property', 'description', 'show_less', 'Show less')
                    : get('property', 'description', 'read_more', 'Read full description')}
                </button>
              ) : null}

              {(attributeFacts.length > 0 || attributeMeta.length > 0) ? (
                <section
                  className="property-details__attrs"
                  aria-labelledby="property-attributes-title"
                >
                  <h4 id="property-attributes-title" className="property-details__attrs-title">
                    Property details
                  </h4>

                  {attributeFacts.length > 0 ? (
                    <dl className="property-details__attrs-list">
                      {attributeFacts.map((row) => (
                        <div key={row.label} className="property-details__attrs-row">
                          <dt>{row.label}</dt>
                          <dd>{row.value}</dd>
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

              <div className="property-details__info-tiles">
                <div
                  className={`property-details__info-tile ${property.floorPlanUrl ? 'property-details__info-tile--has-plan' : ''}`}
                  role="group"
                  aria-label={
                    property.floorPlanUrl
                      ? floorplanHeading
                      : `${floorplanHeading} — available on request`
                  }
                >
                  <span className="property-details__info-tile-icon" aria-hidden="true">
                    <LayoutTemplate size={22} strokeWidth={2} />
                  </span>
                  <div className="property-details__info-tile-copy">
                    <h4>{floorplanHeading}</h4>
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
                      <p>
                        {get(
                          'property',
                          'info_tiles',
                          'floorplan_empty',
                          'Detailed layout available on request from our team.',
                        )}
                      </p>
                    )}
                  </div>
                  <span className="property-details__info-tile-hint">
                    {property.floorPlanUrl
                      ? get('property', 'info_tiles', 'floorplan_hint_has', 'Listing')
                      : get('property', 'info_tiles', 'floorplan_hint_request', 'Request')}
                  </span>
                </div>
                <div
                  className="property-details__info-tile"
                  role="group"
                  aria-label={`${locationHeading} map — coming soon`}
                >
                  <span className="property-details__info-tile-icon" aria-hidden="true">
                    <Map size={22} strokeWidth={2} />
                  </span>
                  <div className="property-details__info-tile-copy">
                    <h4>{locationHeading}</h4>
                    <p>
                      {get(
                        'property',
                        'info_tiles',
                        'location_body',
                        'Map and neighbourhood context — integration in progress.',
                      )}
                    </p>
                  </div>
                  <span className="property-details__info-tile-hint">
                    {get('property', 'info_tiles', 'location_hint', 'Soon')}
                  </span>
                </div>
              </div>
            </article>

            <aside className="property-details__sidebar">
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
                  eyebrow={get('property', 'similar', 'eyebrow', 'Curated for you')}
                  title={get('property', 'similar', 'heading', 'Similar Properties')}
                  description={get(
                    'property',
                    'similar',
                    'description',
                    'More listings that fit this home—matched by area, status, or price band. Open any card for the full story.',
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
