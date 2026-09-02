import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, X, ZoomIn } from 'lucide-react'
import './Gallery.css'

function Gallery({ images = [], title = 'Property gallery' }) {
  const normalizedImages = useMemo(() => images.filter(Boolean), [images])
  const count = normalizedImages.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const thumbRefs = useRef([])
  const lightboxRef = useRef(null)

  useEffect(() => {
    setActiveIndex((i) => (count ? Math.min(i, count - 1) : 0))
  }, [count])

  const go = useCallback(
    (delta) => {
      if (!count) return
      setActiveIndex((i) => (i + delta + count) % count)
      setZoom(1)
    },
    [count],
  )

  const goTo = useCallback(
    (index) => {
      if (index >= 0 && index < count) {
        setActiveIndex(index)
        setZoom(1)
      }
    },
    [count],
  )

  const openLightbox = useCallback(() => {
    setZoom(1)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    setZoom(1)
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100))
  }, [])

  useEffect(() => {
    const el = thumbRefs.current[activeIndex]
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeIndex])

  useEffect(() => {
    function onKey(e) {
      if (lightboxOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          closeLightbox()
          return
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          go(-1)
          return
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          go(1)
          return
        }
        if (e.key === '+' || e.key === '=') {
          e.preventDefault()
          zoomIn()
          return
        }
        if (e.key === '-' || e.key === '_') {
          e.preventDefault()
          zoomOut()
        }
        return
      }

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
  }, [go, lightboxOpen, closeLightbox, zoomIn, zoomOut])

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lightboxRef.current?.focus?.()
    return () => {
      document.body.style.overflow = previous
    }
  }, [lightboxOpen])

  if (!count) return null

  const activeSrc = normalizedImages[activeIndex]

  return (
    <section
      className="gallery"
      aria-label={title}
      role="region"
      aria-roledescription="carousel"
    >
      <div className="gallery__stage">
        <div className="gallery__slides">
          <img
            className="gallery__slide-fill"
            src={activeSrc}
            alt=""
            aria-hidden="true"
            decoding="async"
          />
          {normalizedImages.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className={`gallery__slide-btn ${i === activeIndex ? 'is-active' : ''}`}
              onClick={openLightbox}
              aria-label={`Open preview — photo ${i + 1} of ${count}`}
              tabIndex={i === activeIndex ? 0 : -1}
            >
              <img
                src={src}
                alt={i === activeIndex ? `${title} — photo ${i + 1} of ${count}` : ''}
                className={`gallery__slide ${i === activeIndex ? 'is-active' : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </button>
          ))}
        </div>

        {count > 1 && (
          <>
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
              <button
                type="button"
                className="gallery__zoom-hint"
                onClick={openLightbox}
                aria-label="Open image preview"
              >
                <ZoomIn size={15} strokeWidth={2.2} aria-hidden />
                Preview
              </button>
            </div>
          </>
        )}

        {count === 1 && (
          <div className="gallery__toolbar">
            <button
              type="button"
              className="gallery__zoom-hint"
              onClick={openLightbox}
              aria-label="Open image preview"
            >
              <ZoomIn size={15} strokeWidth={2.2} aria-hidden />
              Preview
            </button>
          </div>
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

      {lightboxOpen ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} preview`}
          ref={lightboxRef}
          tabIndex={-1}
          onClick={closeLightbox}
        >
          <div className="gallery-lightbox__chrome" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-lightbox__top">
              <span className="gallery-lightbox__counter">
                {activeIndex + 1} / {count}
              </span>
              <div className="gallery-lightbox__actions">
                <button
                  type="button"
                  className="gallery-lightbox__btn"
                  onClick={zoomOut}
                  disabled={zoom <= 1}
                  aria-label="Zoom out"
                >
                  <Minus size={18} strokeWidth={2.2} />
                </button>
                <span className="gallery-lightbox__zoom-label">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  className="gallery-lightbox__btn"
                  onClick={zoomIn}
                  disabled={zoom >= 3}
                  aria-label="Zoom in"
                >
                  <Plus size={18} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  className="gallery-lightbox__btn gallery-lightbox__btn--close"
                  onClick={closeLightbox}
                  aria-label="Close preview"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>
            </div>

            <div className="gallery-lightbox__stage">
              {count > 1 ? (
                <button
                  type="button"
                  className="gallery-lightbox__nav gallery-lightbox__nav--prev"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={26} strokeWidth={2} />
                </button>
              ) : null}

              <div className={`gallery-lightbox__frame ${zoom > 1 ? 'is-zoomed' : ''}`}>
                <img
                  src={activeSrc}
                  alt={`${title} — photo ${activeIndex + 1} of ${count}`}
                  className="gallery-lightbox__image"
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                  onClick={() => (zoom > 1 ? zoomOut() : zoomIn())}
                />
              </div>

              {count > 1 ? (
                <button
                  type="button"
                  className="gallery-lightbox__nav gallery-lightbox__nav--next"
                  onClick={() => go(1)}
                  aria-label="Next image"
                >
                  <ChevronRight size={26} strokeWidth={2} />
                </button>
              ) : null}
            </div>

            {count > 1 ? (
              <div className="gallery-lightbox__thumbs" role="tablist" aria-label="Preview thumbnails">
                {normalizedImages.map((image, index) => (
                  <button
                    key={`${image}-lb-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={activeIndex === index}
                    aria-label={`Show image ${index + 1}`}
                    className={`gallery-lightbox__thumb ${activeIndex === index ? 'is-active' : ''}`}
                    onClick={() => goTo(index)}
                  >
                    <img src={image} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default Gallery
