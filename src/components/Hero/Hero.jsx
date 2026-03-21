import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar'
import './Hero.css'

function Hero() {
  const sectionRef = useRef(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

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

  return (
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
          src={shouldLoadVideo ? '/video/real-estate-hero.mp4' : undefined}
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
          className="hero-section__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="hero-section__eyebrow">Cyprus Luxury Real Estate Advisory</p>
          <h1>Exceptional Real Estate for Extraordinary Living</h1>
          <p>
            Discover curated homes, seafront estates, and investment assets across
            Limassol, Nicosia, Larnaca, Paphos, and Protaras.
          </p>
          <div className="hero-section__actions">
            <Link className="btn btn-gold" to="/properties">
              Explore Properties
            </Link>
            <Link className="btn btn-outline-light" to="/contact">
              Book a Consultation
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="hero-section__search"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SearchBar />
        </motion.div>
      </div>

      <a className="hero-section__indicator" href="#featured-properties" aria-label="Scroll">
        <ChevronDown size={22} />
      </a>
    </section>
  )
}

export default Hero
