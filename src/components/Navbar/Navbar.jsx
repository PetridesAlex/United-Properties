import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import StaggeredMenu from '../StaggeredMenu/StaggeredMenu'
import { TELEGRAM_CHAT_URL, WHATSAPP_CHAT_URL } from '../../config/externalLinks'
import './Navbar.css'

/** Premium services strip above the main nav (duplicated in DOM for seamless loop). */
const PREMIUM_SERVICES_TICKER = [
  'Luxury sales & long-term lettings',
  'Private valuations & viewings',
  'Investment & relocation advisory',
  'Off-plan & new developments',
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
                { label: 'Properties', link: '/properties' },
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
