import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import StaggeredMenu from '../StaggeredMenu/StaggeredMenu'
import { TELEGRAM_CHAT_URL, WHATSAPP_CHAT_URL } from '../../config/externalLinks'
import './Navbar.css'

/** Center nav — Montserrat via variables / Google Fonts in index.html */
const CENTER_NAV_LINKS = [
  { label: 'Buy', to: '/buy' },
  { label: 'Rent', to: '/rent' },
  { label: 'Services', to: '/services' },
  { label: 'Property Management', to: '/services#property-management' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const SERVICES_DROPDOWN_LINKS = [
  { label: 'Buy with us', to: '/buy' },
  { label: 'Sell with us', to: '/services#sell-with-us' },
  { label: 'Invest with us', to: '/services#invest-with-us' },
  { label: 'Rent your property', to: '/services#rent-your-property' },
  { label: 'Concierge', to: '/concierge' },
]

function isCenterNavActive(pathname, hash, to) {
  if (to.includes('#')) {
    const [path, h] = to.split('#')
    return pathname === path && hash === `#${h}`
  }
  if (to === '/services') {
    return pathname === '/services' && hash !== '#property-management'
  }
  return pathname === to
}

/** Premium services strip above the main nav (duplicated in DOM for seamless loop). */
const PREMIUM_SERVICES_TICKER = [
  'Luxury sales & long-term lettings',
  'Private valuations & viewings',
  'Investment & relocation advisory',
  'Featured listings & signature collection',
  'International private clients',
  'Concierge property management',
]

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsScrolled(window.scrollY > 40)
  }, [location.pathname])

  const navClass = `navbar ${isScrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'} ${
    isHome && isScrolled ? 'navbar--home-scrolled' : ''
  } ${isScrolled ? 'navbar--scrolled' : ''}`.trim()

  function openGlobalSearch() {
    if (isHome) {
      window.dispatchEvent(new CustomEvent('open-property-search-panel'))
      return
    }
    navigate('/?openSearch=1')
  }

  return (
    <header className={navClass}>
      <section className="navbar__ticker" aria-label="Premium services" role="region">
        <div className="navbar__ticker-viewport">
          <div className="navbar__ticker-track" aria-hidden="true">
            <div className="navbar__ticker-row">
              {PREMIUM_SERVICES_TICKER.map((label, index) => (
                <span key={`ticker-a-${index}`} className="navbar__ticker-chip">
                  {label}
                </span>
              ))}
            </div>
            <div className="navbar__ticker-row">
              {PREMIUM_SERVICES_TICKER.map((label, index) => (
                <span key={`ticker-b-${index}`} className="navbar__ticker-chip">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container navbar__inner navbar__inner--wide">
        <Link to="/" className="navbar__logo" aria-label="United Properties — Home">
          <img src="/images/logo/United_Properties_v2.1.svg" alt="" role="presentation" />
        </Link>

        <nav className="navbar__center" aria-label="Main navigation">
          <ul className="navbar__center-list">
            {CENTER_NAV_LINKS.map((item) => {
              const active = isCenterNavActive(location.pathname, location.hash, item.to)
              const isServicesItem = item.to === '/services'
              return (
                <li
                  key={item.to}
                  className={`navbar__center-item${
                    isServicesItem ? ' navbar__center-item--has-dropdown' : ''
                  }`}
                >
                  {isServicesItem ? (
                    <div className="navbar__center-dropdown">
                      <Link
                        className={`navbar__center-link navbar__center-link--with-caret${
                          active ? ' navbar__center-link--active' : ''
                        }`}
                        to={item.to}
                        aria-haspopup="true"
                      >
                        <span>{item.label}</span>
                        <ChevronDown size={14} aria-hidden="true" />
                      </Link>

                      <div className="navbar__center-dropdown-menu" role="menu" aria-label="Services links">
                        {SERVICES_DROPDOWN_LINKS.map((serviceLink) => {
                          const serviceActive = isCenterNavActive(
                            location.pathname,
                            location.hash,
                            serviceLink.to,
                          )

                          return (
                            <Link
                              key={serviceLink.to}
                              className={`navbar__center-dropdown-item${
                                serviceActive ? ' navbar__center-dropdown-item--active' : ''
                              }`}
                              to={serviceLink.to}
                              role="menuitem"
                            >
                              {serviceLink.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <Link
                      className={`navbar__center-link${active ? ' navbar__center-link--active' : ''}`}
                      to={item.to}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__search-pill"
            aria-label="Search homes and agents"
            onClick={openGlobalSearch}
          >
            <Search size={20} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="navbar__ctas">
            <StaggeredMenu
              className="navbar__staggered"
              position="right"
              items={[
                { label: 'Buy', link: '/buy' },
                { label: 'Rent', link: '/rent' },
                { label: 'Services', link: '/services' },
                { label: 'Property Management', link: '/services#property-management' },
                { label: 'About', link: '/about' },
                { label: 'Contact', link: '/contact' },
                { label: 'Properties', link: '/properties' },
                { label: 'Agents', link: '/agents' },
              ]}
              socialItems={[
                { label: 'Instagram', link: '#' },
                { label: 'LinkedIn', link: '#' },
                { label: 'WhatsApp', link: WHATSAPP_CHAT_URL },
                { label: 'Telegram', link: TELEGRAM_CHAT_URL },
              ]}
              displaySocials
              displayItemNumbering={false}
              menuButtonColor="#ffffff"
              openMenuButtonColor="#ffffff"
              changeMenuColorOnOpen
              colors={['rgba(20, 17, 15, 0.94)', 'rgba(10, 8, 7, 0.96)']}
              accentColor="#a98348"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
