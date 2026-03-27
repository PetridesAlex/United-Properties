import { Link } from 'react-router-dom'

const categoryCards = [
  {
    id: 'featured',
    title: 'Featured Properties',
    description: 'Discover our highlighted homes and investment picks.',
    to: '/featured-properties',
    group: 'Featured Properties',
  },
  {
    id: 'buy',
    title: 'Buy',
    description: 'Explore premium homes available for purchase across Cyprus.',
    to: '/buy',
    group: 'All Listings',
  },
  {
    id: 'rent',
    title: 'Rent',
    description: 'Browse luxury rentals tailored for flexible living.',
    to: '/rent',
    group: 'All Listings',
  },
  {
    id: 'new-dev',
    title: 'New Developments',
    description: 'View the latest projects and upcoming residential launches.',
    to: '/new-developments',
    group: 'New Developments',
  },
  {
    id: 'signature',
    title: 'Signature Listings',
    description: 'Enter our exclusive portfolio of iconic residences.',
    to: '/signature-listings',
    group: 'Signature Listings',
  },
]

function PropertyGrid({ activeCategory }) {
  const visibleCards = categoryCards.filter((card) => {
    if (activeCategory === 'All Listings') return true
    return card.group === activeCategory
  })

  return (
    <div className="search-panel-grid">
      {visibleCards.map((card) => (
        <Link key={card.id} to={card.to} className="search-panel-category-card">
          <div className="search-panel-category-card__placeholder" aria-hidden="true">
            <span>Insert image here</span>
          </div>
          <div className="search-panel-category-card__overlay">
            <p>{card.group}</p>
            <h3>{card.title}</h3>
            <span>{card.description}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default PropertyGrid
