import { Link } from 'react-router-dom'
import {
  Instagram,
  Linkedin,
  MessageCircle,
} from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import { INSTAGRAM_URL, LINKEDIN_URL, WHATSAPP_CHAT_URL } from '../../config/externalLinks'
import CmsText from '../CmsPreview/CmsText'
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
              'Every property decision begins with inspiration. It deserves someone who protects it.',
            )}
          </p>
        </div>

        <div className="footer__col footer__col--links">
          <h4 className="footer__section-title">
            <CmsText page="footer" section="quick_links" field="heading" as="span">
              {get('footer', 'quick_links', 'heading', 'Quick Links')}
            </CmsText>
          </h4>
          <ul className="footer__list footer__list--links">
            <li>
              <Link to="/buy">{get('footer', 'quick_links', 'link_buy', 'Buy')}</Link>
            </li>
            <li>
              <Link to="/rent">{get('footer', 'quick_links', 'link_rent', 'Rent')}</Link>
            </li>
            <li>
              <Link to="/about">{get('footer', 'quick_links', 'link_about', 'About')}</Link>
            </li>
          </ul>
        </div>

        <div className="footer__col footer__col--services">
          <h4 className="footer__section-title">
            <CmsText page="footer" section="services" field="heading" as="span">
              {get('footer', 'services', 'heading', 'United Services')}
            </CmsText>
          </h4>
          <ul className="footer__list footer__list--services">
            <li>
              <Link to="/services#invest-with-us">
                {get('footer', 'services', 'link_invest', 'Invest with us')}
              </Link>
            </li>
            <li>
              <Link to="/services#sell-with-us">
                {get('footer', 'services', 'link_sell', 'Sell with us')}
              </Link>
            </li>
            <li>
              <Link to="/services#property-management">
                {get('footer', 'services', 'link_manage', 'Property management')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer__col footer__col--contact footer__contact-block">
          <h4 className="footer__section-title">
            <CmsText page="footer" section="contact" field="heading" as="span">
              {get('footer', 'contact', 'heading', 'Contact')}
            </CmsText>
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
                href={`tel:${get('footer', 'contact', 'phone', '+357 96178188').replace(/\s+/g, '')}`}
              >
                {get('footer', 'contact', 'phone', '+357 96178188')}
              </a>
            </li>
          </ul>
          <div className="footer__socials">
            <a
              href={INSTAGRAM_URL}
              aria-label={get('footer', 'social', 'instagram', 'Instagram')}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={16} />
            </a>
            <a
              href={LINKEDIN_URL}
              aria-label={get('footer', 'social', 'linkedin', 'LinkedIn')}
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin size={16} />
            </a>
            <a
              href={WHATSAPP_CHAT_URL}
              aria-label={get('footer', 'social', 'whatsapp', 'WhatsApp')}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copyright">
            <span className="footer__copyright-line">
              <span className="footer__copyright-symbol" aria-hidden="true">
                —
              </span>{' '}
              <span className="footer__copyright-year">© {new Date().getFullYear()}</span>
              <span className="footer__copyright-brand">
                {' '}
                {get('footer', 'legal', 'brand', 'United Properties')}
              </span>
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
