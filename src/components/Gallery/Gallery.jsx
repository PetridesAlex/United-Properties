import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import './Gallery.css'

const SWIPE_MIN_PX = 48
const MOSAIC_SIDE = 4

function Gallery({
  images = [],
  title = 'Property gallery',
  brandLabel = '',
  statusLabel = '',
}) {
  const normalizedImages = useMemo(() => images.filter(Boolean), [images])
  const count = normalizedImages.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [frameRatio, setFrameRatio] = useState(4 / 3)
  const lightboxRef = useRef(null)
  const swipeRef = useRef({
    x: 0,
    y: 0,
    active: false,
    swiped: false,
  })

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

  const openLightboxAt = useCallback(
    (index) => {
      if (index >= 0 && index < count) {
        setActiveIndex(index)
        setZoom(1)
        setLightboxOpen(true)
      }
    },
    [count],
  )

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

  const onSwipeStart = useCallback(
    (e) => {
      if (count <= 1) return
      const touch = e.changedTouches?.[0]
      if (!touch) return
      swipeRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        active: true,
        swiped: false,
      }
    },
    [count],
  )

  const onSwipeEnd = useCallback(
    (e) => {
      if (!swipeRef.current.active || count <= 1) return
      if (zoom > 1) {
        swipeRef.current.active = false
        return
      }
      const touch = e.changedTouches?.[0]
      swipeRef.current.active = false
      if (!touch) return

      const dx = touch.clientX - swipeRef.current.x
      const dy = touch.clientY - swipeRef.current.y
      if (Math.abs(dx) < SWIPE_MIN_PX) return
      if (Math.abs(dx) < Math.abs(dy) * 1.15) return

      swipeRef.current.swiped = true
      go(dx < 0 ? 1 : -1)
    },
    [count, go, zoom],
  )

  useEffect(() => {
    function onKey(e) {
      if (!lightboxOpen) return
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
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, lightboxOpen, closeLightbox, zoomIn, zoomOut])

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.classList.add('gallery-lightbox-open')
    lightboxRef.current?.focus?.()
    return () => {
      document.body.style.overflow = previous
      document.documentElement.classList.remove('gallery-lightbox-open')
    }
  }, [lightboxOpen])

  const activeSrc = count ? normalizedImages[Math.min(activeIndex, count - 1)] : ''

  useEffect(() => {
    if (!activeSrc) return undefined
    let cancelled = false
    const probe = new Image()
    probe.onload = () => {
      if (cancelled) return
      const w = probe.naturalWidth
      const h = probe.naturalHeight
      if (w > 0 && h > 0) setFrameRatio(w / h)
    }
    probe.src = activeSrc
    return () => {
      cancelled = true
    }
  }, [activeSrc])

  const mosaicSide = useMemo(() => {
    if (count <= 1) return []
    return normalizedImages.slice(1, 1 + MOSAIC_SIDE)
  }, [normalizedImages, count])

  const extraCount = Math.max(0, count - (1 + mosaicSide.length))
  const showMoreOnLast = extraCount > 0 && mosaicSide.length === MOSAIC_SIDE

  const mosaicCount = Math.min(count, 1 + MOSAIC_SIDE)

  if (!count) return null

  return (
    <section
      className={`gallery gallery--mosaic gallery--mosaic-${mosaicCount}`}
      aria-label={title}
      role="region"
    >
      <div className="gallery__mosaic">
        <button
          type="button"
          className="gallery__mosaic-cell gallery__mosaic-cell--hero"
          onClick={() => openLightboxAt(0)}
          aria-label={`Open preview — photo 1 of ${count}`}
        >
          <img
            src={normalizedImages[0]}
            alt=""
            aria-hidden="true"
            className="gallery__mosaic-fill"
            loading="eager"
            decoding="async"
            draggable={false}
          />
          <img
            src={normalizedImages[0]}
            alt={`${title} — photo 1 of ${count}`}
            className="gallery__mosaic-img"
            loading="eager"
            decoding="async"
            draggable={false}
          />
          {brandLabel ? (
            <span className="gallery__mosaic-brand">{brandLabel}</span>
          ) : null}
          {statusLabel ? (
            <span className="gallery__mosaic-status">{statusLabel}</span>
          ) : null}
        </button>

        {mosaicSide.map((src, i) => {
          const index = i + 1
          const isLast = i === mosaicSide.length - 1
          const showMore = isLast && showMoreOnLast
          return (
            <button
              key={`${src}-mosaic-${index}`}
              type="button"
              className="gallery__mosaic-cell"
              onClick={() => openLightboxAt(showMore ? index : index)}
              aria-label={
                showMore
                  ? `Open gallery — ${extraCount + 1} more photos`
                  : `Open preview — photo ${index + 1} of ${count}`
              }
            >
              <img
                src={src}
                alt=""
                aria-hidden="true"
                className="gallery__mosaic-fill"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <img
                src={src}
                alt=""
                className="gallery__mosaic-img"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              {showMore ? (
                <span className="gallery__mosaic-more" aria-hidden>
                  +{extraCount + 1}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {lightboxOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="gallery-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={`${title} preview`}
              ref={lightboxRef}
              tabIndex={-1}
              onClick={closeLightbox}
            >
              <button
                type="button"
                className="gallery-lightbox__close"
                onClick={(e) => {
                  e.stopPropagation()
                  closeLightbox()
                }}
                aria-label="Exit image preview"
              >
                <X size={18} strokeWidth={2.3} aria-hidden />
                <span>Exit</span>
              </button>

              <div className="gallery-lightbox__chrome" onClick={(e) => e.stopPropagation()}>
                <div
                  className="gallery-lightbox__stage"
                  style={{ '--gallery-ratio': String(frameRatio) }}
                  onTouchStart={onSwipeStart}
                  onTouchEnd={onSwipeEnd}
                >
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
                      onClick={() => {
                        if (swipeRef.current.swiped) {
                          swipeRef.current.swiped = false
                          return
                        }
                        if (zoom > 1) zoomOut()
                        else zoomIn()
                      }}
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
            </div>,
            document.body,
          )
        : null}
    </section>
  )
}

export default Gallery
