import { Link } from 'react-router-dom'

const categoryCards = [
  {
    id: 'featured',
    title: 'Featured Properties',
    description: 'Discover our highlighted homes and investment picks.',
    to: '/properties?mode=buy&status=For+Sale&featured=true',
    group: 'Featured Properties',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'buy',
    title: 'Buy',
    description: 'Explore premium homes available for purchase across Cyprus.',
    to: '/properties?mode=buy&status=For+Sale',
    group: 'All Listings',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'rent',
    title: 'Rent',
    description: 'Browse luxury rentals tailored for flexible living.',
    to: '/properties?mode=rent&status=For+Rent',
    group: 'All Listings',
    image:
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'new-dev',
    title: 'New Developments',
    description: 'View the latest projects and upcoming residential launches.',
    to: '/properties?mode=new-development',
    group: 'New Developments',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'signature',
    title: 'Signature Listings',
    description: 'Enter our exclusive portfolio of iconic residences.',
    to: '/properties?keyword=signature',
    group: 'Signature Listings',
    image:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
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
          <img src={card.image} alt={card.title} />
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
