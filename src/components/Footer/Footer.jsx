import { Link } from 'react-router-dom'
import { Instagram, Linkedin, Facebook, MessageCircle } from 'lucide-react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <h3 className="footer__brand">
            <img src="/images/logo/united-properties-logo.svg" alt="United Properties" />
          </h3>
          <p>
            Bespoke real estate advisory for premium Cyprus homes, investments, and
            international relocation.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/properties">Properties</Link>
            </li>
            <li>
              <Link to="/developments">Developments</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Services</h4>
          <ul>
            <li>Property Sales</li>
            <li>Luxury Rentals</li>
            <li>Property Management</li>
            <li>Relocation Support</li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
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

      <div className="container footer__bottom">
        <p>Copyright {new Date().getFullYear()} United Properties. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
