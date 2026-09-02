import { Link } from 'react-router-dom'

function formatPrice(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

function DiscoveryResults({
  properties,
  loading = false,
  emptyTitle = 'No matches',
  emptyHint = 'Try another location, clear filters, or broaden your search.',
  onNavigate,
}) {
  if (loading && !properties.length) {
    return (
      <div className="search-panel__empty">
        <p className="search-panel__empty-title">Loading homes…</p>
      </div>
    )
  }

  if (!properties.length) {
    return (
      <div className="search-panel__empty">
        <p className="search-panel__empty-title">{emptyTitle}</p>
        <p className="search-panel__empty-hint">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="search-panel__results-grid">
      {properties.map((property) => (
        <Link
          key={property.id}
          to={`/properties/${property.slug}`}
          className="search-panel-card"
          onClick={onNavigate}
          aria-label={`${property.title}. ${property.location}. ${property.status}. EUR ${formatPrice(property.price)}`}
        >
          <div className="search-panel-card__media-wrap">
            {property.image ? (
              <img
                className="search-panel-card__media"
                src={property.image}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="search-panel-card__media search-panel-card__media--empty" aria-hidden="true" />
            )}
            <span className="search-panel-card__badge">{property.status}</span>
          </div>
          <div className="search-panel-card__body">
            <p className="search-panel-card__price">
              EUR {formatPrice(property.price)}
              {property.status === 'For Rent' ? ' / month' : ''}
            </p>
            <h3 className="search-panel-card__title">{property.title}</h3>
            <p className="search-panel-card__location">{property.location}</p>
            <p className="search-panel-card__meta">
              {[
                property.bedrooms != null ? `${property.bedrooms} bed` : null,
                property.bathrooms != null ? `${property.bathrooms} bath` : null,
                property.sqm ? `${property.sqm} sqm` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default DiscoveryResults
