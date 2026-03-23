import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import SearchPanel from '../SearchPanel/SearchPanel'
import './Hero.css'

function Hero() {
  const sectionRef = useRef(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return undefined

    const section = sectionRef.current
    if (!section) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setShouldLoadVideo(true)
        observer.disconnect()
      },
      { threshold: 0.12, rootMargin: '200px 0px' },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onOpenSearch = () => setIsSearchOpen(true)
    window.addEventListener('open-property-search-panel', onOpenSearch)
    return () => window.removeEventListener('open-property-search-panel', onOpenSearch)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('openSearch') !== '1') return
    setIsSearchOpen(true)
    params.delete('openSearch')
    const nextSearch = params.toString()
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true })
  }, [location.pathname, location.search, navigate])

  return (
    <>
      <section className="hero-section" ref={sectionRef}>
        <div
          className="hero-section__media"
          aria-hidden="true"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2000&q=80")',
          }}
        >
          <video
            className="hero-section__video"
            src={shouldLoadVideo ? '/video/cyprus-luxury-real-estate-hero.mp4.mp4' : undefined}
            autoPlay={shouldLoadVideo}
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            poster="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2000&q=80"
          />
        </div>
        <div className="hero-section__overlay" />
        <div className="container hero-section__inner">
          <motion.div
            className="hero-section__trigger"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            role="button"
            tabIndex={0}
            onClick={() => setIsSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setIsSearchOpen(true)
              }
            }}
            aria-label="Open property search panel"
          >
            <button
              type="button"
              className="hero-section__trigger-input"
              aria-label="Open search panel"
              onClick={() => setIsSearchOpen(true)}
            >
              <span>Search properties, locations, agents...</span>
              <span className="hero-section__trigger-map-icon" aria-hidden="true">
                <MapPin size={14} />
              </span>
            </button>
            <button
              type="button"
              className="hero-section__trigger-location"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search by location"
            >
              <Search size={16} />
            </button>
          </motion.div>
        </div>

        <a className="hero-section__indicator" href="#featured-properties" aria-label="Scroll">
          <ChevronDown size={22} />
        </a>
      </section>

      <SearchPanel open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Hero
