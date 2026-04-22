import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Gallery.css'

function Gallery({ images = [], title = 'Property gallery' }) {
  const normalizedImages = useMemo(() => images.filter(Boolean), [images])
  const count = normalizedImages.length
  const [activeIndex, setActiveIndex] = useState(0)
  const thumbRefs = useRef([])

  useEffect(() => {
    setActiveIndex((i) => (count ? Math.min(i, count - 1) : 0))
  }, [count])

  const go = useCallback(
    (delta) => {
      if (!count) return
      setActiveIndex((i) => (i + delta + count) % count)
    },
    [count],
  )

  const goTo = useCallback(
    (index) => {
      if (index >= 0 && index < count) setActiveIndex(index)
    },
    [count],
  )

  useEffect(() => {
    const el = thumbRefs.current[activeIndex]
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeIndex])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  if (!count) return null

  return (
    <section
      className="gallery"
      aria-label={title}
      role="region"
      aria-roledescription="carousel"
    >
      <div className="gallery__stage">
        <div className="gallery__slides">
          {normalizedImages.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={i === activeIndex ? `${title} — photo ${i + 1} of ${count}` : ''}
              className={`gallery__slide ${i === activeIndex ? 'is-active' : ''}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ))}
        </div>

        {count > 1 && (
          <>
            <div className="gallery__chrome" aria-hidden="true" />
            <div className="gallery__arrows gallery__arrows--sides">
              <button
                type="button"
                className="gallery__arrow gallery__arrow--prev"
                onClick={() => go(-1)}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="gallery__arrow gallery__arrow--next"
                onClick={() => go(1)}
                aria-label="Next image"
              >
                <ChevronRight size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="gallery__toolbar">
              <span className="gallery__counter">
                {activeIndex + 1} <span className="gallery__counter-sep">/</span> {count}
              </span>
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="gallery__thumbs" role="tablist" aria-label="Gallery thumbnails">
          {normalizedImages.map((image, index) => (
            <button
              key={`${image}-thumb-${index}`}
              ref={(el) => {
                thumbRefs.current[index] = el
              }}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Show image ${index + 1} of ${count}`}
              className={`gallery__thumb ${activeIndex === index ? 'is-active' : ''}`}
              onClick={() => goTo(index)}
            >
              <img src={image} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default Gallery
