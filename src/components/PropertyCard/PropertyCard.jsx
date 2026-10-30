import { Link } from 'react-router-dom'
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import OptimizedImage from '../OptimizedImage/OptimizedImage'
import './PropertyCard.css'
import './PropertyCardListing.css'

const MotionArticle = motion.article
const MotionSpan = motion.span

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

function listingTagText(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('rent')) return 'For rent'
  if (s.includes('sale')) return 'For sale'
  return status || ''
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
  imageSizes = '(max-width: 640px) 96vw, (max-width: 1100px) 46vw, 380px',
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
    <MotionArticle
      className={`property-card ${isSignature ? 'property-card--signature' : 'card-luxury'} ${
        isCover ? 'property-card--cover' : ''
      }`.trim()}
      whileHover={isCover ? { y: -2 } : { y: -4 }}
      transition={{ duration: 0.22 }}
      data-cms-property-id={property.id || undefined}
      data-cms-property-slug={property.slug || undefined}
    >
      {isCover ? (
        <Link
          className="property-card__cover-whole"
          to={`/properties/${property.slug}`}
          aria-label={coverLinkLabel}
        >
          <div className="property-card__media">
            <OptimizedImage
              src={property.image}
              alt=""
              preset="card"
              sizes={imageSizes}
            />
            <span className={`property-card__status-pill property-card__status-pill--${badgeVariant}`}>
              {property.status === 'For Rent'
                ? 'For Rent'
                : property.status === 'For Sale'
                  ? 'For Sale'
                  : property.status}
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
              aria-label={`${property.bedrooms} ${bedsLabel.toLowerCase()}${
                sqmLabel != null ? `, ${sqmLabel} square metres` : ''
              }, ${property.bathrooms} ${bathsLabel.toLowerCase()}`}
            >
              <li>
                <BedDouble size={14} strokeWidth={1.85} aria-hidden />
                <span>
                  {property.bedrooms} {bedsLabel}
                </span>
              </li>
              {areaLabel ? (
                <li>
                  <Ruler size={14} strokeWidth={1.85} aria-hidden />
                  <span>{areaLabel}</span>
                </li>
              ) : null}
              <li>
                <Bath size={14} strokeWidth={1.85} aria-hidden />
                <span>
                  {property.bathrooms} {bathsLabel}
                </span>
              </li>
            </ul>
          </div>
        </Link>
      ) : (
        <Link
          className="upc"
          to={`/properties/${property.slug}`}
          aria-label={`View listing: ${property.title}`}
        >
          <div className="upc__media">
            <OptimizedImage
              src={property.image}
              alt={`${property.title} in ${property.location}`}
              preset="card"
              sizes="(max-width: 640px) 96vw, (max-width: 1100px) 46vw, 380px"
            />
            <span className="upc__tag" data-listing={badgeVariant}>
              {listingTagText(property.status)}
            </span>
            {isSignature && <span className="upc__signature">United Properties. Signature</span>}
          </div>
          <div className="upc__body">
            <h3 className="upc__title">{property.title}</h3>
            {locationLine ? (
              <p className="upc__location">
                <MapPin size={14} strokeWidth={1.6} aria-hidden /> {locationLine}
              </p>
            ) : null}
            {showDescription && <p className="upc__description">{property.description}</p>}
            <hr className="upc__rule" />
            <div className="upc__foot">
              <ul className="upc__specs">
                {areaLabel ? (
                  <li>
                    <Ruler size={14} strokeWidth={1.6} aria-hidden />
                    <span>{areaLabel}</span>
                  </li>
                ) : null}
                {Number(property.bedrooms) > 0 ? (
                  <li>
                    <BedDouble size={14} strokeWidth={1.6} aria-hidden />
                    <span>
                      {property.bedrooms}
                      <span className="upc__sr"> {bedsLabel}</span>
                    </span>
                  </li>
                ) : null}
                {Number(property.bathrooms) > 0 ? (
                  <li>
                    <Bath size={14} strokeWidth={1.6} aria-hidden />
                    <span>
                      {property.bathrooms}
                      <span className="upc__sr"> {bathsLabel}</span>
                    </span>
                  </li>
                ) : null}
              </ul>
              <p className="upc__price">{formatPrice(property.price, property.status)}</p>
            </div>
          </div>
        </Link>
      )}
    </MotionArticle>
  )
}

export default PropertyCard
