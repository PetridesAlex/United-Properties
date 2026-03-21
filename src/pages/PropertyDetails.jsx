import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import {
  BedDouble,
  Bath,
  Ruler,
  Car,
  CalendarClock,
  LandPlot,
  MessageCircle,
  MapPin,
} from 'lucide-react'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import Gallery from '../components/Gallery/Gallery'
import InquiryForm from '../components/InquiryForm/InquiryForm'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import { properties } from '../data/properties'
import { agents } from '../data/agents'
import './PropertyDetails.css'

function PropertyDetails() {
  const { slug } = useParams()
  const property = properties.find((item) => item.slug === slug) || properties[0]
  const agent = agents.find((item) => item.id === property.agentId)
  const similarProperties = properties
    .filter((item) => item.id !== property.id && item.location === property.location)
    .slice(0, 3)

  return (
    <>
      <Helmet>
        <title>{property.title} | UNITED PROPERTIES</title>
      </Helmet>

      <section className="page-hero page-hero--property">
        <div className="container">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Properties', to: '/properties' },
              { label: property.title },
            ]}
          />
          <h1 className="property-details__hero-title">{property.title}</h1>
          <p className="property-details__hero-location">
            <MapPin size={16} /> {property.location}
          </p>
        </div>
      </section>

      <section className="section section--light">
        <div className="container property-details">
          <Gallery images={property.gallery} title={property.title} />

          <div className="property-details__head card-luxury">
            <div>
              <p className="property-details__status">{property.status}</p>
              <h2 className="property-details__price">EUR {property.price.toLocaleString()}</h2>
              <p className="property-details__summary">{property.description}</p>
            </div>
            <a className="btn btn-gold" href="https://wa.me/35700000000" target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp Inquiry
            </a>
          </div>

          <div className="property-details__overview card-luxury">
            <span>
              <BedDouble size={16} /> {property.bedrooms} Bedrooms
            </span>
            <span>
              <Bath size={16} /> {property.bathrooms} Bathrooms
            </span>
            <span>
              <Ruler size={16} /> {property.sqm} sqm internal area
            </span>
            <span>
              <LandPlot size={16} /> {property.plotSize || 'N/A'} sqm plot size
            </span>
            <span>
              <Car size={16} /> {property.parking} Parking
            </span>
            <span>
              <CalendarClock size={16} /> Built in {property.yearBuilt}
            </span>
          </div>

          <div className="property-details__content-grid">
            <article className="card-luxury property-details__description">
              <h3>Description</h3>
              <p>{property.description}</p>
              <h4>Amenities and Features</h4>
              <ul>
                {property.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="property-details__placeholders">
                <div>
                  <h4>Floor Plan</h4>
                  <p>Detailed floor plan available upon request.</p>
                </div>
                <div>
                  <h4>Map</h4>
                  <p>Interactive map integration placeholder for future API connection.</p>
                </div>
              </div>
            </article>

            <aside className="property-details__sidebar">
              {agent && (
                <article className="card-luxury property-details__agent">
                  <img src={agent.image} alt={agent.name} />
                  <h4>{agent.name}</h4>
                  <p>{agent.role}</p>
                  <Link to="/agents" className="btn btn-outline-dark">
                    View Agent Profile
                  </Link>
                </article>
              )}
              <InquiryForm />
            </aside>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeader title="Similar Properties" />
          <div className="grid-3">
            {similarProperties.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </div>
      </section>

      <div className="property-details__mobile-cta">
        <a className="btn btn-gold" href="https://wa.me/35700000000" target="_blank" rel="noreferrer">
          <MessageCircle size={16} /> WhatsApp
        </a>
        <Link className="btn btn-outline-dark" to="/contact">
          Contact Team
        </Link>
      </div>
    </>
  )
}

export default PropertyDetails
