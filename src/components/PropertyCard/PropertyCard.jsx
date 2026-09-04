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
  const bathsLabel = property.bathrooms === 1 ? 'FULL BATH' : 'FULL BATHS'
  const bedsLabel = property.bedrooms === 1 ? 'BED' : 'BEDS'
  const areaLabel = sqmLabel != null ? `${sqmLabel} SQM` : null

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
            <p className="property-card__address-line">{addressDisplay}</p>
            <p
              className="property-card__specs-line"
              aria-label={`${property.bedrooms} bedrooms, ${property.bathrooms} full bathrooms${
                sqmLabel != null ? `, ${sqmLabel} square metres` : ''
              }`}
            >
              <span>
                {property.bedrooms} {bedsLabel}
              </span>
              <span className="property-card__specs-dot" aria-hidden>
                •
              </span>
              <span>
                {property.bathrooms} {bathsLabel}
              </span>
              {areaLabel ? (
                <>
                  <span className="property-card__specs-dot" aria-hidden>
                    •
                  </span>
                  <span>{areaLabel}</span>
                </>
              ) : null}
            </p>
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
