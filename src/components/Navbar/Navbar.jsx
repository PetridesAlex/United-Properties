import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import StaggeredMenu from '../StaggeredMenu/StaggeredMenu'
import { TELEGRAM_CHAT_URL, WHATSAPP_CHAT_URL } from '../../config/externalLinks'
import { useSiteContent } from '../../hooks/useSiteContent'
import './Navbar.css'

const CENTER_NAV_ROUTES = [
  { key: 'buy', to: '/buy', fallback: 'Buy' },
  { key: 'rent', to: '/rent', fallback: 'Rent' },
  { key: 'services', to: '/services', fallback: 'United Services' },
  { key: 'about', to: '/about', fallback: 'About' },
  { key: 'contact', to: '/contact', fallback: 'Contact' },
]

const SERVICES_DROPDOWN_ROUTES = [
  { key: 'sell', to: '/sell-with-us', fallback: 'Sell with us' },
  { key: 'invest', to: '/services#invest-with-us', fallback: 'Invest with us' },
  { key: 'management', to: '/services#property-management', fallback: 'Property Management' },
  { key: 'rent_property', to: '/services#rent-your-property', fallback: 'Rent your property' },
  { key: 'concierge', to: '/concierge', fallback: 'Concierge' },
]

const TICKER_FALLBACKS = [
  'Luxury sales & long-term lettings',
  'Private valuations & viewings',
  'Investment & relocation advisory',
  'Featured listings & signature collection',
  'International private clients',
  'Concierge property management',
]

function isCenterNavActive(pathname, hash, to) {
  if (to.includes('#')) {
    const [path, h] = to.split('#')
    return pathname === path && hash === `#${h}`
  }
  if (to === '/services') {
    return pathname === '/services' || pathname === '/sell-with-us'
  }
  return pathname === to
}

function Navbar() {
  const { get } = useSiteContent()
  const [isScrolled, setIsScrolled] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const servicesDropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  const premiumServicesTicker = useMemo(
    () =>
      TICKER_FALLBACKS.map((fallback, index) =>
        get('navbar', 'ticker', `item${index + 1}`, fallback),
      ),
    [get],
  )

  const centerNavLinks = useMemo(
    () =>
      CENTER_NAV_ROUTES.map((item) => ({
        to: item.to,
        label: get('navbar', 'nav', item.key, item.fallback),
      })),
    [get],
  )

  const servicesDropdownLinks = useMemo(
    () =>
      SERVICES_DROPDOWN_ROUTES.map((item) => ({
        to: item.to,
        label: get('navbar', 'services_dropdown', item.key, item.fallback),
      })),
    [get],
  )

  const staggeredMenuItems = useMemo(
    () =>
      centerNavLinks.map((item) =>
        item.to === '/services'
          ? {
              label: item.label,
              subItems: servicesDropdownLinks.map((s) => ({ label: s.label, link: s.to })),
            }
          : { label: item.label, link: item.to },
      ),
    [centerNavLinks, servicesDropdownLinks],
  )

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsScrolled(window.scrollY > 40)
  }, [location.pathname])

  useEffect(() => {
    setServicesDropdownOpen(false)
  }, [location.pathname, location.hash])

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

  function closeUnitedServicesMenu() {
    setServicesDropdownOpen(false)
    requestAnimationFrame(() => {
      const root = servicesDropdownRef.current
      const active = document.activeElement
      if (root && active instanceof HTMLElement && root.contains(active)) {
        active.blur()
      }
    })
  }

  return (
    <header className={navClass}>
      <section className="navbar__ticker" aria-label="Premium services" role="region">
        <div className="navbar__ticker-viewport">
          <div className="navbar__ticker-track" aria-hidden="true">
            <div className="navbar__ticker-row">
              {premiumServicesTicker.map((label, index) => (
                <span key={`ticker-a-${index}`} className="navbar__ticker-chip">
                  {label}
                </span>
              ))}
            </div>
            <div className="navbar__ticker-row">
              {premiumServicesTicker.map((label, index) => (
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
            {centerNavLinks.map((item) => {
              const active = isCenterNavActive(location.pathname, location.hash, item.to)
              const isServicesItem = item.to === '/services'
              return (
                <li
                  key={item.to}
                  className={`navbar__center-item${
                    isServicesItem ? ' navbar__center-item--has-dropdown' : ''
                  }${
                    isServicesItem && servicesDropdownOpen ? ' navbar__center-item--services-open' : ''
                  }`}
                  onMouseEnter={() => {
                    if (isServicesItem) setServicesDropdownOpen(true)
                  }}
                  onMouseLeave={() => {
                    if (isServicesItem) setServicesDropdownOpen(false)
                  }}
                >
                  {isServicesItem ? (
                    <div ref={servicesDropdownRef} className="navbar__center-dropdown">
                      <Link
                        className={`navbar__center-link navbar__center-link--with-caret${
                          active ? ' navbar__center-link--active' : ''
                        }`}
                        to={item.to}
                        aria-haspopup="true"
                        onClick={closeUnitedServicesMenu}
                      >
                        <span>{item.label}</span>
                        <ChevronDown size={14} aria-hidden="true" />
                      </Link>

                      <div className="navbar__center-dropdown-menu" role="menu" aria-label="United Services links">
                        {servicesDropdownLinks.map((serviceLink) => {
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
                              onClick={closeUnitedServicesMenu}
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
              items={staggeredMenuItems}
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
