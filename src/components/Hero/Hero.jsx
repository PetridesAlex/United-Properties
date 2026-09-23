import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildSearchPath } from '../../lib/search/searchPath'
import { useSiteContent } from '../../hooks/useSiteContent'
import CmsText from '../CmsPreview/CmsText'
import './Hero.css'

/** Served from `public/video/hero-video-optimize-united-properties.mp4` */
const HERO_VIDEO_SRC = '/video/hero-video-optimize-united-properties.mp4'
const HERO_VIDEO_POSTER = '/images/video/hero-luxury-real-estate-cyprus-poster.jpg'

function Hero() {
  const { get } = useSiteContent()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
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
        if (!entry) return
        if (entry.isIntersecting) {
          setShouldLoadVideo(true)
          const el = videoRef.current
          if (el) {
            const p = el.play()
            if (p && typeof p.catch === 'function') p.catch(() => {})
          }
        } else if (videoRef.current) {
          videoRef.current.pause()
        }
      },
      { threshold: 0.12, rootMargin: '120px 0px' },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onOpenSearch = () => navigate(buildSearchPath())
    window.addEventListener('open-property-search-panel', onOpenSearch)
    return () => window.removeEventListener('open-property-search-panel', onOpenSearch)
  }, [navigate])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('openSearch') !== '1') return
    navigate(buildSearchPath(), { replace: true })
  }, [location.pathname, location.search, navigate])

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
    <section
      className="hero-section"
      ref={sectionRef}
      data-cms-page="home"
      data-cms-section="hero"
    >
      <div className="hero-section__media" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-section__video"
          src={shouldLoadVideo ? HERO_VIDEO_SRC : undefined}
          poster={HERO_VIDEO_POSTER}
          autoPlay={shouldLoadVideo}
          muted
          loop
          playsInline
          preload={shouldLoadVideo ? 'metadata' : 'none'}
          disablePictureInPicture
        />
      </div>

      <div className="hero-section__premium" aria-hidden="true">
        <div className="hero-section__ambient" />
        <div className="hero-section__vignette" />
        <div className="hero-section__grain" />
      </div>

      <div className="hero-section__overlay" />

      <div className="hero-section__copy">
        {get('home', 'hero', 'eyebrow') ? (
          <CmsText page="home" section="hero" field="eyebrow" as="p" className="hero-section__eyebrow">
            {get('home', 'hero', 'eyebrow')}
          </CmsText>
        ) : null}
        {get('home', 'hero', 'heading') ? (
          <CmsText page="home" section="hero" field="heading" as="h1" className="hero-section__heading">
            {get('home', 'hero', 'heading')}
          </CmsText>
        ) : null}
        {get('home', 'hero', 'description') ? (
          <CmsText page="home" section="hero" field="description" as="p" className="hero-section__lede">
            {get('home', 'hero', 'description')}
          </CmsText>
        ) : null}
      </div>

      <a className="hero-section__indicator" href="#featured-properties" aria-label="Scroll">
        <ChevronDown size={22} />
      </a>
    </section>
  )
}

export default Hero
