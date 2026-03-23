import { Link } from 'react-router-dom'

function SignatureListingsList({ listings }) {
  return (
    <aside className="search-panel-signature">
      <h3 className="search-panel__section-title">Signature Listings</h3>
      {listings.length ? (
        <ul>
          {listings.map((property) => (
            <li key={property.id}>
              <Link to="/properties">
                <img src={property.image} alt={property.title} />
                <div>
                  <strong>EUR {new Intl.NumberFormat('en-US').format(property.price)}</strong>
                  <p>{property.title}</p>
                  <small>
                    {property.city} - {property.area}
                  </small>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="search-panel__empty-inline">No signature listings for your filters.</p>
      )}
    </aside>
  )
}

export default SignatureListingsList
