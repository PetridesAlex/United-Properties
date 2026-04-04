import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Building2, ChevronDown, KeyRound, MapPin, Megaphone, Search } from 'lucide-react'
import StaggeredMenu from '../StaggeredMenu/StaggeredMenu'
import { SANITY_STUDIO_URL, TELEGRAM_CHAT_URL, WHATSAPP_CHAT_URL } from '../../config/externalLinks'
import { TelegramBrandIcon, WhatsAppBrandIcon } from './SocialBrandIcons'
import './Navbar.css'

const navTabs = [
  { key: 'properties', label: 'Properties', to: '/properties', hasDropdownIcon: true },
  { key: 'development', label: 'New Development', to: '/new-developments' },
  { key: 'agents', label: 'Agents', to: '/agents' },
]

/** Premium services strip above the main nav (duplicated in DOM for seamless loop). */
const PREMIUM_SERVICES_TICKER = [
  'Luxury sales & long-term lettings',
  'Private valuations & viewings',
  'Investment & relocation advisory',
  'Off-plan & new developments',
  'International private clients',
  'Concierge property management',
]

const propertySubItems = [
  {
    key: 'buy',
    label: 'Buy',
    hint: 'Homes & investments',
    to: '/buy',
    icon: Building2,
  },
  {
    key: 'rent',
    label: 'Rent',
    hint: 'Long & seasonal lets',
    to: '/rent',
    icon: KeyRound,
  },
  {
    key: 'sell',
    label: 'Sell',
    hint: 'List with our team',
    to: '/contact',
    icon: Megaphone,
  },
]

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [propertiesMenuOpen, setPropertiesMenuOpen] = useState(false)
  const [supportsHoverMenu, setSupportsHoverMenu] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(hover: hover)').matches : false,
  )
  const propertiesDropdownRef = useRef(null)
  const propertiesTriggerId = useId()
  const propertiesMenuId = useId()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    /* Any device that reports real hover (mouse / most trackpads). Omit pointer:fine so hybrid laptops still get hover menus. */
    const mq = window.matchMedia('(hover: hover)')
    const sync = () => setSupportsHoverMenu(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setPropertiesMenuOpen(false)
  }, [location.key])

  useEffect(() => {
    if (!propertiesMenuOpen) return undefined
    function handlePointerDown(event) {
      const root = propertiesDropdownRef.current
      if (!root || root.contains(event.target)) return
      setPropertiesMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [propertiesMenuOpen])

  useEffect(() => {
    if (!propertiesMenuOpen) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') setPropertiesMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [propertiesMenuOpen])

  useEffect(() => {
    const el = propertiesDropdownRef.current
    if (!el) return undefined
    function handleFocusOut(event) {
      const next = event.relatedTarget
      if (next instanceof Node && el.contains(next)) return
      setPropertiesMenuOpen(false)
    }
    el.addEventListener('focusout', handleFocusOut)
    return () => el.removeEventListener('focusout', handleFocusOut)
  }, [])

  const navClass = `navbar ${isScrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'} ${
    isHome && isScrolled ? 'navbar--home-scrolled' : ''
  }`.trim()
  const isPropertiesActive =
    location.pathname === '/properties' ||
    location.pathname === '/buy' ||
    location.pathname === '/rent'

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
          <img src="/images/logo/united-properties-logo.png" alt="" role="presentation" />
          <span className="navbar__logo-wordmark" aria-hidden="true">
            <span className="navbar__logo-line navbar__logo-line--top">United</span>
            <span className="navbar__logo-line navbar__logo-line--bottom">Properties</span>
          </span>
        </Link>

        <nav className="navbar__desktop">
          {navTabs.map((tab) => {
            if (tab.key === 'properties') {
              return (
                <div
                  ref={propertiesDropdownRef}
                  className={`navbar__nav-dropdown${propertiesMenuOpen ? ' navbar__nav-dropdown--open' : ''}`.trim()}
                  key={tab.key}
                  onMouseEnter={() => supportsHoverMenu && setPropertiesMenuOpen(true)}
                  onMouseLeave={() => supportsHoverMenu && setPropertiesMenuOpen(false)}
                >
                  <button
                    type="button"
                    id={propertiesTriggerId}
                    className={`navbar__nav-trigger navbar__nav-trigger--button ${
                      isPropertiesActive ? 'active' : ''
                    }`.trim()}
                    aria-haspopup="true"
                    aria-expanded={propertiesMenuOpen}
                    aria-controls={propertiesMenuId}
                    onFocus={() => {
                      if (supportsHoverMenu) setPropertiesMenuOpen(true)
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      /* Hover-capable: open/close is driven by mouse enter/leave; click would fight hover and collapse the menu. */
                      if (supportsHoverMenu) return
                      setPropertiesMenuOpen((open) => !open)
                    }}
                  >
                    <span>{tab.label}</span>
                    <ChevronDown size={13} aria-hidden="true" />
                  </button>
                  <div
                    id={propertiesMenuId}
                    className="navbar__dropdown-menu"
                    role="menu"
                    aria-label="Properties menu"
                    aria-labelledby={propertiesTriggerId}
                    aria-hidden={!propertiesMenuOpen}
                  >
                    {propertySubItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.key}
                          to={item.to}
                          className="navbar__dropdown-item"
                          role="menuitem"
                          onClick={() => setPropertiesMenuOpen(false)}
                        >
                          <span className="navbar__dropdown-item-icon" aria-hidden="true">
                            <Icon size={18} strokeWidth={2} />
                          </span>
                          <span className="navbar__dropdown-item-body">
                            <span className="navbar__dropdown-item-label">{item.label}</span>
                            <span className="navbar__dropdown-item-hint">{item.hint}</span>
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

            return (
              <NavLink
                key={tab.key}
                to={tab.to}
                className={({ isActive }) => `navbar__nav-trigger ${isActive ? 'active' : ''}`.trim()}
              >
                <span>{tab.label}</span>
                {tab.hasDropdownIcon && <ChevronDown size={13} aria-hidden="true" />}
              </NavLink>
            )
          })}
        </nav>

        <a
          href={SANITY_STUDIO_URL}
          className="navbar__cms-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Portal
        </a>

        <div className="navbar__actions">
          <div className="navbar__socials" aria-label="WhatsApp and Telegram">
            <a
              href={WHATSAPP_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__social-btn navbar__social-btn--whatsapp"
              aria-label="WhatsApp — chat on WhatsApp"
              title="WhatsApp"
            >
              <WhatsAppBrandIcon size={26} />
            </a>
            <a
              href={TELEGRAM_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__social-btn navbar__social-btn--telegram"
              aria-label="Telegram — chat on Telegram"
              title="Telegram"
            >
              <TelegramBrandIcon size={26} />
            </a>
          </div>

          <button
            type="button"
            className="navbar__search-pill"
            aria-label="Search homes and agents"
            onClick={openGlobalSearch}
          >
            <Search size={14} />
            <span>United Properties. Homes &amp; Agents</span>
            <span className="navbar__search-pill-map" aria-hidden="true">
              <MapPin size={13} />
            </span>
          </button>

          <div className="navbar__ctas">
            <StaggeredMenu
              className="navbar__staggered"
              position="right"
              items={[
                { label: 'Buy', link: '/buy' },
                { label: 'Rent', link: '/rent' },
                { label: 'New Development', link: '/new-developments' },
                { label: 'Agents', link: '/agents' },
                { label: 'Contact', link: '/contact' },
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
              colors={['rgba(32, 28, 24, 0.5)', 'rgba(16, 14, 12, 0.58)']}
              accentColor="#a98348"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
