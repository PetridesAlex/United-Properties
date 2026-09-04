import { Link } from 'react-router-dom'
import {
  Instagram,
  Linkedin,
  Facebook,
  MessageCircle,
} from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import './Footer.css'

function Footer() {
  const { get } = useSiteContent()

  return (
    <footer className="footer" data-cms-page="footer" data-cms-section="brand">
      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
          <h3 className="footer__brand">
            <img src="/images/logo/United_Properties_v2.1.svg" alt="United Properties" />
          </h3>
          <p className="footer__brand-copy">
            {get(
              'footer',
              'brand',
              'tagline',
              'Bespoke real estate advisory for premium Cyprus homes, investments, and international relocation.',
            )}
          </p>
        </div>

        <div className="footer__col footer__col--links">
          <h4 className="footer__section-title">
            {get('footer', 'quick_links', 'heading', 'Quick Links')}
          </h4>
          <ul className="footer__list footer__list--links">
            <li>
              <Link to="/">{get('footer', 'quick_links', 'link_home', 'Home')}</Link>
            </li>
            <li>
              <Link to="/properties">
                {get('footer', 'quick_links', 'link_properties', 'Properties')}
              </Link>
            </li>
            <li>
              <Link to="/about">{get('footer', 'quick_links', 'link_about', 'About')}</Link>
            </li>
            <li>
              <Link to="/videos/luxury-real-estate-cyprus">
                {get('footer', 'quick_links', 'link_video', 'Brand video')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer__col footer__col--services">
          <h4 className="footer__section-title">
            {get('footer', 'services', 'heading', 'Services')}
          </h4>
          <ul className="footer__list footer__list--services">
            <li>{get('footer', 'services', 'item1', 'Property Sales')}</li>
            <li>{get('footer', 'services', 'item2', 'Luxury Rentals')}</li>
            <li>{get('footer', 'services', 'item3', 'Property Management')}</li>
            <li>{get('footer', 'services', 'item4', 'Relocation Support')}</li>
          </ul>
        </div>

        <div className="footer__col footer__col--contact footer__contact-block">
          <h4 className="footer__section-title">
            {get('footer', 'contact', 'heading', 'Contact')}
          </h4>
          <ul className="footer__list footer__list--contact">
            <li>
              {get('footer', 'contact', 'address', '18 Marina Avenue, Limassol, Cyprus')}
            </li>
            <li>
              <a href={`mailto:${get('footer', 'contact', 'email', 'info@unitedproperties.eu')}`}>
                {get('footer', 'contact', 'email', 'info@unitedproperties.eu')}
              </a>
            </li>
            <li>
              <a
                href={`tel:${get('footer', 'contact', 'phone', '+357 25 123 456').replace(/\s+/g, '')}`}
              >
                {get('footer', 'contact', 'phone', '+357 25 123 456')}
              </a>
            </li>
          </ul>
          <div className="footer__socials">
            <a href="#" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="#" aria-label="Facebook">
              <Facebook size={16} />
            </a>
            <a href="https://wa.me/35700000000" aria-label="WhatsApp" target="_blank" rel="noreferrer">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="container footer__newsletter">
        <h4>{get('footer', 'newsletter', 'heading', 'Private Market Updates')}</h4>
        <form onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder={get('footer', 'newsletter', 'placeholder', 'Enter your email')}
          />
          <button className="btn btn-gold" type="submit">
            {get('footer', 'newsletter', 'submit', 'Subscribe')}
          </button>
        </form>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copyright">
            <span className="footer__copyright-line">
              <span className="footer__copyright-symbol" aria-hidden="true">
                —
              </span>{' '}
              <span className="footer__copyright-year">© {new Date().getFullYear()}</span>
              <span className="footer__copyright-brand"> United Properties</span>
              <span className="footer__copyright-dot"> · </span>
              <span className="footer__copyright-rights">
                {get('footer', 'legal', 'rights', 'All rights reserved')}
              </span>
              <span className="footer__copyright-symbol" aria-hidden="true">
                {' '}
                —
              </span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
