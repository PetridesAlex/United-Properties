import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Building2, ChevronDown, KeyRound, MapPin, Megaphone, Search } from 'lucide-react'
import StaggeredMenu from '../StaggeredMenu/StaggeredMenu'
import './Navbar.css'

const navTabs = [
  { key: 'properties', label: 'Properties', to: '/properties', hasDropdownIcon: true },
  { key: 'development', label: 'New Development', to: '/new-developments' },
  { key: 'agents', label: 'Agents', to: '/agents' },
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

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2C6.58 2 2.17 6.4 2.17 11.86c0 1.93.56 3.82 1.63 5.44L2 22l4.82-1.75a9.83 9.83 0 0 0 5.2 1.5h.01c5.45 0 9.86-4.4 9.86-9.86S17.49 2 12.04 2Zm0 17.95h-.01a8.06 8.06 0 0 1-4.1-1.13l-.3-.18-2.86 1.04 1.06-2.78-.2-.32a8.07 8.07 0 1 1 6.42 3.37Zm4.42-6.02c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.65-1.2-1.44-1.34-1.68-.14-.24-.01-.37.11-.49.1-.1.24-.27.36-.4.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.43-.06-.12-.54-1.3-.74-1.79-.2-.47-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 1.99s.86 2.3.98 2.46c.12.16 1.68 2.56 4.06 3.59.57.24 1.01.38 1.35.49.57.18 1.08.15 1.49.09.45-.07 1.4-.57 1.6-1.13.2-.55.2-1.02.14-1.13-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  )
}

function TelegramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.44 4.62a1.27 1.27 0 0 0-1.3-.17L3.3 10.97a1.24 1.24 0 0 0 .08 2.35l3.48 1.13 1.34 4.26a1.25 1.25 0 0 0 2.07.52l2.03-1.96 3.98 2.93a1.26 1.26 0 0 0 1.97-.74l3.23-13.6a1.25 1.25 0 0 0-.04-.84Zm-4.66 3.1-7.2 6.5a.32.32 0 0 0-.1.18l-.28 2.46a.14.14 0 0 1-.27.03l-.95-3.03a.31.31 0 0 0-.2-.2l-2.42-.79a.14.14 0 0 1-.01-.27L19.9 6.97a.14.14 0 0 1 .14.23l-8.53 7.6a.31.31 0 0 0 .03.48l4.65 3.43a.14.14 0 0 0 .22-.08l2.87-12.08a.14.14 0 0 0-.23-.14l-2.27 1.31Z" />
    </svg>
  )
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [propertiesDropdownDismissed, setPropertiesDropdownDismissed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
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
      {isHome && !isScrolled && (
        <div className="container navbar__topline navbar__inner--wide" aria-label="Top bar">
          <span className="navbar__topline-spacer" aria-hidden="true" />
          <p className="navbar__topline-text">United Properties</p>
          <div className="navbar__topline-socials">
            <a href="https://wa.me/35700000000" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
            <a href="#" aria-label="Telegram">
              <TelegramIcon />
            </a>
            <a href="#" aria-label="Instagram">
              <InstagramIcon />
            </a>
          </div>
        </div>
      )}

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
                  className={`navbar__nav-dropdown${propertiesDropdownDismissed ? ' navbar__nav-dropdown--dismissed' : ''}`.trim()}
                  key={tab.key}
                  onMouseLeave={() => setPropertiesDropdownDismissed(false)}
                >
                  <button
                    type="button"
                    className={`navbar__nav-trigger navbar__nav-trigger--button ${
                      isPropertiesActive ? 'active' : ''
                    }`.trim()}
                    aria-haspopup="true"
                  >
                    <span>{tab.label}</span>
                    <ChevronDown size={13} aria-hidden="true" />
                  </button>
                  <div className="navbar__dropdown-menu" role="menu" aria-label="Properties menu">
                    {propertySubItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.key}
                          to={item.to}
                          className="navbar__dropdown-item"
                          role="menuitem"
                          onClick={() => setPropertiesDropdownDismissed(true)}
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
            panelEyebrow="United Properties"
            panelTitle="Menu"
            panelTagline="Homes & agents"
            panelLocation="Limassol"
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
              { label: 'WhatsApp', link: 'https://wa.me/35700000000' },
            ]}
            displaySocials
            displayItemNumbering={false}
            menuButtonColor="#ffffff"
            openMenuButtonColor="#ffffff"
            changeMenuColorOnOpen
            colors={['#2b2926', '#141312']}
            accentColor="#a98348"
          />
        </div>
      </div>
    </header>
  )
}

export default Navbar
