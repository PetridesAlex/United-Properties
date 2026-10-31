import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import SiteMenu from '../SiteMenu/SiteMenu'
import UnitedTicker from '../UnitedTicker/UnitedTicker'
import { INSTAGRAM_URL, LINKEDIN_URL, TELEGRAM_CHAT_URL, WHATSAPP_CHAT_URL } from '../../config/externalLinks'
import { buildSearchPath } from '../../lib/search/searchPath'
import { useSiteContent } from '../../hooks/useSiteContent'
import './Navbar.css'

const CENTER_NAV_ROUTES = [
  { key: 'buy', to: '/buy', fallback: 'Buy' },
  { key: 'rent', to: '/rent', fallback: 'Rent' },
  { key: 'services', to: '/services', fallback: 'United Services' },
  { key: 'about', to: '/about', fallback: 'About' },
  { key: 'contact', to: '/contact', fallback: 'Contact' },
]

const MENU_ROUTES = [
  { to: '/buy', label: 'Buy' },
  { to: '/rent', label: 'Rent' },
  { to: '/services', label: 'United services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function isCenterNavActive(pathname, to) {
  return pathname === to
}

function Navbar() {
  const { get } = useSiteContent()
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  const centerNavLinks = useMemo(
    () =>
      CENTER_NAV_ROUTES.map((item) => ({
        to: item.to,
        label: get('navbar', 'nav', item.key, item.fallback),
      })),
    [get],
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

  const navClass = `navbar ${isScrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'} ${
    isHome && isScrolled ? 'navbar--home-scrolled' : ''
  } ${isScrolled ? 'navbar--scrolled' : ''}`.trim()

  function openGlobalSearch() {
    navigate(buildSearchPath())
  }

  return (
    <header className={navClass} data-cms-page="navbar" data-cms-section="nav">
      <UnitedTicker />

      <div className="container navbar__inner navbar__inner--wide">
        <Link
          to="/"
          className="navbar__logo"
          aria-label={get('navbar', 'nav', 'logo_aria', 'United Properties — Home')}
        >
          <img src="/images/logo/United_Properties_v2.1.svg" alt="" role="presentation" />
        </Link>

        <nav className="navbar__center" aria-label={get('navbar', 'nav', 'main_aria', 'Main navigation')}>
          <ul className="navbar__center-list">
            {centerNavLinks.map((item) => {
              const active = isCenterNavActive(location.pathname, item.to)
              return (
                <li key={item.to} className="navbar__center-item">
                  <Link
                    className={`navbar__center-link${active ? ' navbar__center-link--active' : ''}`}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            className={`navbar__search-pill${location.pathname === '/search' ? ' is-active' : ''}`}
            aria-label={get('navbar', 'nav', 'search_aria', 'Search homes and agents')}
            onClick={openGlobalSearch}
          >
            <Search size={20} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="navbar__ctas">
            <SiteMenu
              items={MENU_ROUTES}
              socials={[
                { key: 'instagram', label: 'Instagram', link: INSTAGRAM_URL },
                { key: 'linkedin', label: 'LinkedIn', link: LINKEDIN_URL },
                { key: 'whatsapp', label: 'WhatsApp', link: WHATSAPP_CHAT_URL },
                { key: 'telegram', label: 'Telegram', link: TELEGRAM_CHAT_URL },
              ]}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
