import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import './CTASection.css'

function CTASection({ title, description, primaryTo = '/properties', primaryLabel }) {
  const { get } = useSiteContent()
  const resolvedTitle =
    title ?? get('home', 'cta', 'heading', 'Ready to Find Your Ideal Property in Cyprus?')
  const resolvedDescription =
    description ??
    get(
      'home',
      'cta',
      'description',
      'Connect with our advisors for a tailored strategy across premium Cyprus locations.',
    )

  return (
    <section className="cta-section section" data-cms-page="home" data-cms-section="cta">
      <div className="container">
        <div className="cta-section__panel">
          <h2>{resolvedTitle}</h2>
          <p>{resolvedDescription}</p>
          <div className="cta-section__actions">
            <Link to={primaryTo} className="btn btn-gold">
              {primaryLabel ?? get('home', 'cta', 'btn_listings', 'View Listings')}
            </Link>
            <Link to="/contact" className="btn btn-outline-light">
              {get('home', 'cta', 'btn_contact', 'Contact Our Team')}
            </Link>
            <a
              href="https://wa.me/35700000000"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-light"
            >
              <MessageCircle size={16} /> {get('home', 'cta', 'btn_whatsapp', 'WhatsApp')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
