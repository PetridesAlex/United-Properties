import { Link } from 'react-router-dom'

function formatPrice(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

function DiscoveryResults({
  properties,
  emptyTitle = 'No matches',
  emptyHint = 'Relax a filter or clear the search to see more listings.',
}) {
  if (!properties.length) {
    return (
      <div className="search-panel__empty">
        <p className="search-panel__empty-title">{emptyTitle}</p>
        <p className="search-panel__empty-hint">{emptyHint}</p>
      </div>
    )
  }

  return (
    <>
      <div className="search-panel__results-grid">
        {properties.map((p) => (
          <Link
            key={p.id}
            to={`/buy?location=${encodeURIComponent(p.city)}`}
            className="search-panel-card"
            aria-label={`${p.title}. ${p.city}, ${p.area}. ${p.type}. EUR ${formatPrice(p.price)}`}
          >
            <img
              className="search-panel-card__media"
              src={p.image}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div className="search-panel-card__scrim" aria-hidden="true" />
            <span className="search-panel-card__badge">{p.type}</span>
            <div className="search-panel-card__body">
              <p className="search-panel-card__location">
                {p.city} · {p.area}
              </p>
              <p className="search-panel-card__price">
                <span className="search-panel-card__price-curr">EUR</span>
                <span className="search-panel-card__price-num">{formatPrice(p.price)}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

export default DiscoveryResults
