import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildSearchPath } from '../../lib/search/searchPath'
import { useSiteContent } from '../../hooks/useSiteContent'
import CmsText from '../CmsPreview/CmsText'

/** Served from `public/video/hero-video-optimize-united-properties.mp4` */
const HERO_VIDEO_SRC = '/video/hero-video-optimize-united-properties.mp4'
const HERO_VIDEO_POSTER = '/images/video/hero-luxury-real-estate-cyprus-poster.jpg'

const DEFAULT_HERO_LEDE = 'Cyprus leads. Limassol grows. Be part of it.'
const HEADING_WORDS = ['Confidence', 'in', 'every', 'move.']

/** Prefer the new premium lede when CMS still holds the retired boutique line. */
function resolveHeroLede(raw) {
  const text = String(raw || '').trim()
  if (!text || /^boutique by design/i.test(text)) return DEFAULT_HERO_LEDE
  return text
}

function Hero() {
  const { get } = useSiteContent()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const headingRaw = get('home', 'hero', 'heading', 'Confidence in every move.')
  const headingTrimmed = String(headingRaw || '').trim() || 'Confidence in every move.'
  const displayHeading = /\.$/.test(headingTrimmed) ? headingTrimmed : `${headingTrimmed}.`
  const useAnimatedHeading = /^confidence\s+in\s+every\s+move\.?$/i.test(displayHeading)
  const eyebrow = get('home', 'hero', 'eyebrow', 'United Properties  ·  Cyprus')
  const lede = resolveHeroLede(get('home', 'hero', 'description', DEFAULT_HERO_LEDE))

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || reduceMotion) return undefined

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
  }, [reduceMotion])

  const loadVideo = shouldLoadVideo && !reduceMotion

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('openSearch') !== '1') return
    navigate(buildSearchPath(), { replace: true })
  }, [location.pathname, location.search, navigate])

  useEffect(() => {
    if (!loadVideo) return undefined
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
  }, [loadVideo])

  return (
    <section className="hh" ref={sectionRef} data-cms-page="home" data-cms-section="hero">
      <video
        ref={videoRef}
        className="up-hero-media"
        src={loadVideo ? HERO_VIDEO_SRC : undefined}
        poster={HERO_VIDEO_POSTER}
        autoPlay={loadVideo}
        muted
        loop
        playsInline
        preload={loadVideo ? 'metadata' : 'none'}
        disablePictureInPicture
        aria-hidden="true"
      />

      <div className="hh__copy">
        {eyebrow ? (
          <CmsText page="home" section="hero" field="eyebrow" as="span" className="lbl lbl--center">
            {eyebrow}
          </CmsText>
        ) : null}

        {useAnimatedHeading && !reduceMotion ? (
          <h1 aria-label={displayHeading}>
            {HEADING_WORDS.map((word, i) => (
              <span key={word} className="bw" style={{ animationDelay: `${0.05 + i * 0.1}s` }}>
                {word}
                {i < HEADING_WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
        ) : headingTrimmed ? (
          <CmsText page="home" section="hero" field="heading" as="h1">
            {displayHeading}
          </CmsText>
        ) : null}

        {lede ? (
          <CmsText
            page="home"
            section="hero"
            field="description"
            as="p"
            className={`sub${reduceMotion || !useAnimatedHeading ? '' : ' fc'}`}
          >
            {lede}
          </CmsText>
        ) : null}
      </div>
    </section>
  )
}

export default Hero
