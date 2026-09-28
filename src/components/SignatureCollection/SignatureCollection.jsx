import {useCallback, useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {motion, useReducedMotion} from 'framer-motion'
import OptimizedImage from '../OptimizedImage/OptimizedImage'
import './SignatureCollection.css'

function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return ''
  return `EUR ${Number(value).toLocaleString('en-US')}`
}

/**
 * Lightweight horizontal snap showcase — no scroll hijacking, no continuous RAF.
 */
function SignatureCollection({
  properties = [],
  viewCta = 'View Property',
  browseCta = 'Browse signature listings',
  browseTo = '/signature-listings',
}) {
  const trackRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateChrome = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const cards = Array.from(track.querySelectorAll('.signature-collection__card'))
    if (!cards.length) {
      setCanPrev(false)
      setCanNext(false)
      return
    }

    const trackRect = track.getBoundingClientRect()
    const trackCenter = trackRect.left + trackRect.width / 2
    let closest = 0
    let closestDist = Infinity

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect()
      const cardCenter = rect.left + rect.width / 2
      const dist = Math.abs(cardCenter - trackCenter)
      if (dist < closestDist) {
        closestDist = dist
        closest = index
      }
    })

    setActiveIndex(closest)
    setCanPrev(track.scrollLeft > 8)
    setCanNext(track.scrollLeft < track.scrollWidth - track.clientWidth - 8)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        updateChrome()
      })
    }

    updateChrome()
    track.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', updateChrome, {passive: true})

    return () => {
      if (raf) cancelAnimationFrame(raf)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateChrome)
    }
  }, [properties.length, updateChrome])

  const scrollToIndex = useCallback((index) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelectorAll('.signature-collection__card')[index]
    if (!card) return
    card.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [])

  const step = useCallback(
    (direction) => {
      const next = Math.min(properties.length - 1, Math.max(0, activeIndex + direction))
      scrollToIndex(next)
    },
    [activeIndex, properties.length, scrollToIndex],
  )

  if (!properties.length) return null

  return (
    <div className="signature-collection">
      <div className="signature-collection__toolbar">
        <p className="signature-collection__count" aria-live="polite">
          {activeIndex + 1} <span>/</span> {properties.length}
        </p>
        <div className="signature-collection__controls">
          <button
            type="button"
            className="signature-collection__nav"
            aria-label="Previous property"
            disabled={!canPrev}
            onClick={() => step(-1)}
          >
            <ChevronLeft size={20} strokeWidth={1.8} aria-hidden />
          </button>
          <button
            type="button"
            className="signature-collection__nav"
            aria-label="Next property"
            disabled={!canNext}
            onClick={() => step(1)}
          >
            <ChevronRight size={20} strokeWidth={1.8} aria-hidden />
          </button>
        </div>
      </div>

      <div
        className="signature-collection__track"
        ref={trackRef}
        role="list"
        tabIndex={0}
        aria-label="Signature collection"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            step(1)
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            step(-1)
          }
        }}
      >
        {properties.map((property, index) => {
          const cover = property.coverImage || property.image || ''
          const isActive = index === activeIndex

          return (
            <motion.article
              key={property.id}
              className={`signature-collection__card${isActive ? ' is-active' : ''}`}
              role="listitem"
              initial={reduceMotion ? false : {opacity: 0, y: 28}}
              whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.35}}
              transition={{duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 3) * 0.06}}
            >
              <div className="signature-collection__media">
                {cover ? (
                  <OptimizedImage
                    src={cover}
                    alt=""
                    preset="signature"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    sizes="(max-width: 820px) 88vw, min(1040px, 78vw)"
                  />
                ) : (
                  <div className="signature-collection__media-fallback" aria-hidden />
                )}
                <div className="signature-collection__veil" aria-hidden />
              </div>

              <div className="signature-collection__body">
                <p className="signature-collection__location">{property.location}</p>
                <h3 className="signature-collection__title">{property.title}</h3>
                <p className="signature-collection__price">{formatPrice(property.price)}</p>
                <div className="signature-collection__meta">
                  {property.bedrooms != null ? <span>{property.bedrooms} Beds</span> : null}
                  {property.bathrooms != null ? <span>{property.bathrooms} Baths</span> : null}
                  {property.sqm != null ? <span>{Number(property.sqm).toLocaleString('en-US')} sqm</span> : null}
                </div>
                <Link to={`/properties/${property.slug}`} className="btn btn-outline-light">
                  {viewCta}
                </Link>
              </div>
            </motion.article>
          )
        })}
      </div>

      <div className="signature-collection__dots" role="tablist" aria-label="Signature slides">
        {properties.map((property, index) => (
          <button
            key={`dot-${property.id}`}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Show ${property.title}`}
            className={`signature-collection__dot${index === activeIndex ? ' is-active' : ''}`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>

      <div className="signature-collection__footer">
        <Link to={browseTo} className="signature-collection__browse">
          {browseCta}
        </Link>
      </div>
    </div>
  )
}

export default SignatureCollection
