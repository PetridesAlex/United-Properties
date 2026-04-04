import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import SearchPanel from '../SearchPanel/SearchPanel'
import './Hero.css'

const HERO_VIDEO_SRC = '/video/united-properties-mp4.mp4'

function Hero() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchSeed, setSearchSeed] = useState(null)
  const [searchSeedKey, setSearchSeedKey] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  const openSearchPanel = useCallback((nextSeed) => {
    setSearchSeed(nextSeed)
    setSearchSeedKey((key) => key + 1)
    setIsSearchOpen(true)
  }, [])

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
    const onOpenSearch = () => openSearchPanel(null)
    window.addEventListener('open-property-search-panel', onOpenSearch)
    return () => window.removeEventListener('open-property-search-panel', onOpenSearch)
  }, [openSearchPanel])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('openSearch') !== '1') return
    openSearchPanel(null)
    params.delete('openSearch')
    const nextSearch = params.toString()
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true })
  }, [location.pathname, location.search, navigate, openSearchPanel])

  /** Browsers often need an explicit play() after dynamic src attach (muted + playsInline still). */
  useEffect(() => {
    if (!shouldLoadVideo) return undefined
    const el = videoRef.current
    if (!el) return undefined

    function tryPlay() {
      const p = el.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => {})
      }
    }

    tryPlay()
    el.addEventListener('loadeddata', tryPlay)
    return () => el.removeEventListener('loadeddata', tryPlay)
  }, [shouldLoadVideo])

  return (
    <>
      <section className="hero-section" ref={sectionRef}>
        <div
          className="hero-section__media"
          aria-hidden="true"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2400&q=90")',
          }}
        >
          <video
            ref={videoRef}
            className="hero-section__video"
            src={shouldLoadVideo ? HERO_VIDEO_SRC : undefined}
            autoPlay={shouldLoadVideo}
            muted
            loop
            playsInline
            preload={shouldLoadVideo ? 'auto' : 'none'}
            disablePictureInPicture
            poster="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2400&q=90"
          />
        </div>

        <div className="hero-section__premium" aria-hidden="true">
          <div className="hero-section__ambient" />
          <div className="hero-section__vignette" />
          <div className="hero-section__grain" />
        </div>

        <div className="hero-section__overlay" />

        <a className="hero-section__indicator" href="#featured-properties" aria-label="Scroll">
          <ChevronDown size={22} />
        </a>
      </section>

      <SearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        seed={searchSeed}
        seedKey={searchSeedKey}
      />
    </>
  )
}

export default Hero
