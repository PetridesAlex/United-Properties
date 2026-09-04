import { Link } from 'react-router-dom'
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import './PropertyCard.css'

function formatPrice(value, status) {
  const formatter = new Intl.NumberFormat('en-US')
  return status === 'For Rent'
    ? `EUR ${formatter.format(value)} / month`
    : `EUR ${formatter.format(value)}`
}

function formatSqm(sqm) {
  const n = Number(sqm)
  if (!Number.isFinite(n) || n <= 0) return null
  return n.toLocaleString('en-US')
}

function badgeVariantFromStatus(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('rent')) return 'rent'
  if (s.includes('sold')) return 'sold'
  if (s.includes('reserved')) return 'reserved'
  if (s.includes('sale')) return 'sale'
  return 'sale'
}

function PropertyCard({
  property,
  variant = 'default',
  showDescription = false,
  showButton = true,
}) {
  const isSignature = variant === 'signature'
  const isCover = variant === 'cover'
  const badgeVariant = badgeVariantFromStatus(property.status)
  const reduceMotion = useReducedMotion()
  const streetAddress = property.address || property.title
  const locationLine = property.location?.trim() || ''
  const addressDisplay =
    locationLine && streetAddress && !streetAddress.toLowerCase().includes(locationLine.toLowerCase())
      ? `${streetAddress}, ${locationLine}`
      : streetAddress || locationLine
  const showSignaturePill = Boolean(property.featured || property.isSignature)
  const sqmLabel = formatSqm(property.sqm)
  const bathsLabel = property.bathrooms === 1 ? 'Bath' : 'Baths'
  const bedsLabel = property.bedrooms === 1 ? 'Bed' : 'Beds'
  const areaLabel = sqmLabel != null ? `${sqmLabel} sqm` : null

  const coverLinkLabel = `View listing: ${property.title}`

  return (
    <motion.article
      className={`property-card ${isSignature ? 'property-card--signature' : 'card-luxury'} ${
        isCover ? 'property-card--cover' : ''
      }`.trim()}
      whileHover={isCover ? { y: -2 } : { y: -4 }}
      transition={{ duration: 0.22 }}
    >
      {isCover ? (
        <Link
          className="property-card__cover-whole"
          to={`/properties/${property.slug}`}
          aria-label={coverLinkLabel}
        >
          <div className="property-card__media">
            <img src={property.image} alt="" />
            <span className={`property-card__status-pill property-card__status-pill--${badgeVariant}`}>
              {property.status === 'For Rent'
                ? 'FOR RENT'
                : property.status === 'For Sale'
                  ? 'FOR SALE'
                  : property.status.toUpperCase()}
            </span>
            {showSignaturePill ? (
              <span className="property-card__signature-pill">United Properties · Signature</span>
            ) : null}
          </div>
          <div className="property-card__body property-card__body--cover">
            <p className="property-card__price property-card__price--cover">
              {formatPrice(property.price, property.status)}
            </p>
            <h3 className="property-card__cover-title">{property.title}</h3>
            {locationLine || addressDisplay ? (
              <p className="property-card__cover-location">
                <MapPin size={14} strokeWidth={1.85} aria-hidden />
                <span>{locationLine || addressDisplay}</span>
              </p>
            ) : null}
            <ul
              className="property-card__specs"
              aria-label={`${property.bedrooms} ${bedsLabel.toLowerCase()}, ${property.bathrooms} ${bathsLabel.toLowerCase()}${
                sqmLabel != null ? `, ${sqmLabel} square metres` : ''
              }`}
            >
              <li>
                <BedDouble size={14} strokeWidth={1.85} aria-hidden />
                <span>
                  {property.bedrooms} {bedsLabel}
                </span>
              </li>
              <li>
                <Bath size={14} strokeWidth={1.85} aria-hidden />
                <span>
                  {property.bathrooms} {bathsLabel}
                </span>
              </li>
              {areaLabel ? (
                <li>
                  <Ruler size={14} strokeWidth={1.85} aria-hidden />
                  <span>{areaLabel}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </Link>
      ) : (
        <>
          <div className="property-card__media">
            <img src={property.image} alt={`${property.title} in ${property.location}`} />
            <motion.span
              className={`property-card__badge property-card__badge--${badgeVariant}`}
              data-listing={badgeVariant}
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            >
              <span className="property-card__badge-main">{property.status}</span>
              {property.type ? (
                <>
                  <span className="property-card__badge-sep" aria-hidden="true" />
                  <span className="property-card__badge-type">{property.type}</span>
                </>
              ) : null}
            </motion.span>
            {isSignature && <span className="property-card__signature">United Properties. Signature</span>}
          </div>
          <div className="property-card__content">
            <p className="property-card__price">{formatPrice(property.price, property.status)}</p>
            <h3>{property.title}</h3>
            <p className="property-card__location">
              <MapPin size={15} /> {property.location}
            </p>
            {showDescription && <p className="property-card__description">{property.description}</p>}
            <div className="property-card__meta">
              <span>
                <BedDouble size={16} /> {property.bedrooms} Beds
              </span>
              <span>
                <Bath size={16} /> {property.bathrooms} Baths
              </span>
              <span>
                <Ruler size={16} /> {property.sqm} sqm
              </span>
            </div>
            {showButton && (
              <Link className="btn btn-outline-dark" to={`/properties/${property.slug}`}>
                View Details
              </Link>
            )}
          </div>
        </>
      )}
    </motion.article>
  )
}

export default PropertyCard
