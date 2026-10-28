import { Link } from 'react-router-dom'
import { Instagram, Linkedin, MessageCircle } from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import { INSTAGRAM_URL, LINKEDIN_URL, WHATSAPP_CHAT_URL } from '../../config/externalLinks'
import CmsText from '../CmsPreview/CmsText'
import './Footer.css'

function Footer() {
  const { get } = useSiteContent()
  const year = new Date().getFullYear()
  const email = get('footer', 'contact', 'email', 'info@unitedproperties.eu')
  const phone = get('footer', 'contact', 'phone', '+357 96178188')
  const phoneHref = `tel:${phone.replace(/\s+/g, '')}`

  return (
    <footer className="up-footer" data-cms-page="footer" data-cms-section="brand">
      <div className="g">
        <div className="c">
          <Link to="/" className="up-footer__logo" aria-label="United Properties — Home">
            <img src="/images/logo/United_Properties_v2.1.svg" alt="United Properties" />
          </Link>
        </div>

        <div className="c">
          <h4>
            <CmsText page="footer" section="quick_links" field="heading" as="span">
              {get('footer', 'quick_links', 'heading', 'Quick Links')}
            </CmsText>
          </h4>
          <ul>
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

        <div className="c">
          <h4>
            <CmsText page="footer" section="services" field="heading" as="span">
              {get('footer', 'services', 'heading', 'United Services')}
            </CmsText>
          </h4>
          <ul>
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

        <div className="c">
          <h4>
            <CmsText page="footer" section="contact" field="heading" as="span">
              {get('footer', 'contact', 'heading', 'Contact')}
            </CmsText>
          </h4>
          <ul>
            <li className="pl">
              {get(
                'footer',
                'contact',
                'address',
                'John F. Kennedy 8, Neapolis, Limassol, Cyprus',
              )}
            </li>
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>
              <a href={phoneHref}>{phone}</a>
            </li>
          </ul>
          <div className="soc">
            <a
              href={INSTAGRAM_URL}
              aria-label={get('footer', 'social', 'instagram', 'Instagram')}
              target="_blank"
              rel="noreferrer"
            >
              <i>
                <Instagram size={18} aria-hidden="true" />
              </i>
            </a>
            <a
              href={LINKEDIN_URL}
              aria-label={get('footer', 'social', 'linkedin', 'LinkedIn')}
              target="_blank"
              rel="noreferrer"
            >
              <i>
                <Linkedin size={18} aria-hidden="true" />
              </i>
            </a>
            <a
              href={WHATSAPP_CHAT_URL}
              aria-label={get('footer', 'social', 'whatsapp', 'WhatsApp')}
              target="_blank"
              rel="noreferrer"
            >
              <i>
                <MessageCircle size={18} aria-hidden="true" />
              </i>
            </a>
          </div>
        </div>
      </div>

      <div className="leg">
        <p>{get('footer', 'legal', 'company', 'PKM United Properties Ltd')}</p>
        <p>{get('footer', 'legal', 'reg', 'Reg. No. 1393 · Lic. No. 703/E')}</p>
      </div>

      <div className="cp">
        — © {year} {get('footer', 'legal', 'brand', 'United Properties')} ·{' '}
        {get('footer', 'legal', 'rights', 'All rights reserved')} ·{' '}
        <Link to="/privacy" className="up-footer__privacy">
          {get('footer', 'legal', 'privacy', 'Privacy Policy')}
        </Link>{' '}
        —
      </div>
    </footer>
  )
}

export default Footer
