import { Link } from 'react-router-dom'
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import './PropertyCard.css'

function formatPrice(value, status) {
  const formatter = new Intl.NumberFormat('en-US')
  return status === 'For Rent'
    ? `EUR ${formatter.format(value)} / month`
    : `EUR ${formatter.format(value)}`
}

function PropertyCard({
  property,
  variant = 'default',
  showDescription = true,
  showButton = true,
}) {
  const isSignature = variant === 'signature'

  return (
    <motion.article
      className={`property-card ${isSignature ? 'property-card--signature' : 'card-luxury'}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div className="property-card__media">
        <img src={property.image} alt={`${property.title} in ${property.location}`} />
        <span className="property-card__badge">{property.status}</span>
        {isSignature && <span className="property-card__signature">UNITED PROPERTIES. Signature</span>}
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
    </motion.article>
  )
}

export default PropertyCard
