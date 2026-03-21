import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircle } from 'lucide-react'
import StaggeredMenu from '../StaggeredMenu/StaggeredMenu'
import './Navbar.css'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/developments', label: 'Developments' },
  { to: '/agents', label: 'Agents' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showPropertiesDropdown, setShowPropertiesDropdown] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setShowPropertiesDropdown(false)
  }, [location.pathname])

  const navClass = `navbar ${isScrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'}`

  return (
    <header className={navClass}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          AURA CYPRUS
        </Link>

        <nav className="navbar__desktop">
          <div
            className="navbar__dropdown"
            onMouseEnter={() => setShowPropertiesDropdown(true)}
            onMouseLeave={() => setShowPropertiesDropdown(false)}
          >
            <NavLink to="/properties" className={({ isActive }) => (isActive ? 'active' : '')}>
              Properties <ChevronDown size={14} />
            </NavLink>
            <AnimatePresence>
              {showPropertiesDropdown && (
                <motion.div
                  className="navbar__dropdown-menu"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <Link to="/properties">All Listings</Link>
                  <Link to="/properties?status=For+Sale">For Sale</Link>
                  <Link to="/properties?status=For+Rent">For Rent</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__ctas">
          <a
            className="btn btn-outline-light navbar__wa"
            href="https://wa.me/35700000000"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} />
          </a>
          <Link to="/contact" className="btn btn-gold">
            Book a Consultation
          </Link>
          <StaggeredMenu
            className="navbar__staggered"
            position="right"
            items={[
              { label: 'Home', link: '/' },
              { label: 'Properties', link: '/properties' },
              { label: 'About', link: '/about' },
              { label: 'Services', link: '/services' },
              { label: 'Developments', link: '/developments' },
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
