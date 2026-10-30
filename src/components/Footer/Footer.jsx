import { Link } from 'react-router-dom'
import { Instagram, Linkedin } from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import {
  INSTAGRAM_URL,
  LINKEDIN_URL,
  TELEGRAM_CHAT_URL,
  WHATSAPP_CHAT_URL,
} from '../../config/externalLinks'
import { OPEN_COOKIE_SETTINGS_EVENT } from '../CookiePreferences/CookiePreferences'
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
            <li>
              <Link to="/contact">{get('footer', 'quick_links', 'link_contact', 'Contact')}</Link>
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
              className="soc__wa"
            >
              <i>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
              </i>
            </a>
            <a
              href={TELEGRAM_CHAT_URL}
              aria-label={get('footer', 'social', 'telegram', 'Telegram')}
              target="_blank"
              rel="noreferrer"
              className="soc__tg"
            >
              <i>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
        {get('footer', 'legal', 'rights', 'All rights reserved')}{' '}
        <span className="ps">· </span>
        <br className="pb" />
        <button
          type="button"
          className="up-footer__cookies"
          onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
        >
          Cookie settings
        </button>{' '}
        —
        <br />
        <span className="up-footer__by">
          Website by{' '}
          <a href="https://www.webrunneragency.com/" target="_blank" rel="noopener noreferrer">
            WebRunner Agency
          </a>
        </span>
      </div>
    </footer>
  )
}

export default Footer
