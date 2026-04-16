import { Link } from 'react-router-dom'
import { Instagram, Linkedin, Facebook, MessageCircle, LayoutDashboard } from 'lucide-react'
import { SANITY_STUDIO_URL } from '../../config/externalLinks'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
          <h3 className="footer__brand">
            <img src="/images/logo/United_Properties_v2.1.svg" alt="United Properties" />
          </h3>
          <p className="footer__brand-copy">
            Bespoke real estate advisory for premium Cyprus homes, investments, and
            international relocation.
          </p>
        </div>

        <div className="footer__col footer__col--links">
          <h4 className="footer__section-title">Quick Links</h4>
          <ul className="footer__list footer__list--links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/properties">Properties</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/videos/luxury-real-estate-cyprus">Brand video</Link>
            </li>
          </ul>
        </div>

        <div className="footer__col footer__col--services">
          <h4 className="footer__section-title">Services</h4>
          <ul className="footer__list footer__list--services">
            <li>Property Sales</li>
            <li>Luxury Rentals</li>
            <li>Property Management</li>
            <li>Relocation Support</li>
          </ul>
        </div>

        <div className="footer__col footer__col--contact footer__contact-block">
          <h4 className="footer__section-title">Contact</h4>
          <ul className="footer__list footer__list--contact">
            <li>18 Marina Avenue, Limassol, Cyprus</li>
            <li>
              <a href="mailto:info@unitedproperties.eu">info@unitedproperties.eu</a>
            </li>
            <li>
              <a href="tel:+35725123456">+357 25 123 456</a>
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
          <a
            className="footer__portal"
            href={SANITY_STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open team Portal (content management) in a new tab"
          >
            <span className="footer__portal-icon" aria-hidden="true">
              <LayoutDashboard size={22} strokeWidth={1.85} />
            </span>
            <span className="footer__portal-copy">
              <span className="footer__portal-title">Portal</span>
              <span className="footer__portal-sub">Team login · Listings &amp; content</span>
            </span>
          </a>
        </div>
      </div>

      <div className="container footer__newsletter">
        <h4>Private Market Updates</h4>
        <form onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input id="newsletter-email" type="email" placeholder="Enter your email" />
          <button className="btn btn-gold" type="submit">
            Subscribe
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
              <span className="footer__copyright-rights">All rights reserved</span>
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
