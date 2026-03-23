import { Link } from 'react-router-dom'

function formatPrice(price) {
  return `EUR ${new Intl.NumberFormat('en-US').format(price)}`
}

function PropertyCard({ property }) {
  return (
    <Link to="/properties" className="search-panel-card">
      <img src={property.image} alt={property.title} />
      <div className="search-panel-card__body">
        <p className="search-panel-card__label">{property.category}</p>
        <h3>{property.title}</h3>
        <p className="search-panel-card__meta">
          {property.city} - {property.area}
        </p>
        <p className="search-panel-card__type">{property.type}</p>
        <strong>{formatPrice(property.price)}</strong>
      </div>
    </Link>
  )
}

export default PropertyCard
