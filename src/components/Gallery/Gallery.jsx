import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {ChevronLeft, ChevronRight, X} from 'lucide-react'
import OptimizedImage from '../OptimizedImage/OptimizedImage'
import {optimizeImageUrl} from '../../lib/media/optimizeImageUrl'
import './Gallery.css'

const SWIPE_MIN_PX = 42
const SWIPE_LOCK_PX = 10
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
  const [dragX, setDragX] = useState(0)
  const lightboxRef = useRef(null)
  const swipeRef = useRef({
    pointerId: null,
    x: 0,
    y: 0,
    dx: 0,
    active: false,
    locked: false,
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
      setDragX(0)
    },
    [count],
  )

  const goTo = useCallback(
    (index) => {
      if (index >= 0 && index < count) {
        setActiveIndex(index)
        setZoom(1)
        setDragX(0)
      }
    },
    [count],
  )

  const openLightboxAt = useCallback(
    (index) => {
      if (index >= 0 && index < count) {
        setActiveIndex(index)
        setZoom(1)
        setDragX(0)
        setLightboxOpen(true)
      }
    },
    [count],
  )

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    setZoom(1)
    setDragX(0)
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100))
  }, [])

  const resetSwipe = useCallback(() => {
    swipeRef.current = {
      pointerId: null,
      x: 0,
      y: 0,
      dx: 0,
      active: false,
      locked: false,
      swiped: swipeRef.current.swiped,
    }
    setDragX(0)
  }, [])

  const onPointerDown = useCallback(
    (e) => {
      if (swipeRef.current.active && swipeRef.current.pointerId !== e.pointerId) {
        // a second finger (pinch): stop the swipe so nothing jumps
        swipeRef.current.active = false
        swipeRef.current.vertical = false
        setDragX(0)
        return
      }
      if (count <= 1 || zoom > 1) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (e.target instanceof Element && e.target.closest('button')) return

      swipeRef.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        dx: 0,
        active: true,
        locked: false,
        swiped: false,
      }
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId)
      } catch {
        // ignore capture failures
      }
    },
    [count, zoom],
  )

  const onPointerMove = useCallback((e) => {
    const swipe = swipeRef.current
    if (!swipe.active || swipe.pointerId !== e.pointerId) return

    const dx = e.clientX - swipe.x
    const dy = e.clientY - swipe.y

    if (!swipe.locked) {
      if (Math.abs(dx) < SWIPE_LOCK_PX && Math.abs(dy) < SWIPE_LOCK_PX) return
      if (Math.abs(dx) >= Math.abs(dy) * 0.6) {
        swipe.locked = true
      } else if (dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.5) {
        // clearly downward: a swipe down closes the viewer (phones)
        swipe.vertical = true
        swipe.locked = true
      } else {
        swipe.active = false
        setDragX(0)
        return
      }
    }

    if (swipe.vertical) {
      swipe.dy = dy
      if (e.cancelable) e.preventDefault()
      return
    }

    swipe.dx = dx
    setDragX(dx)
    if (e.cancelable) e.preventDefault()
  }, [])

  const finishSwipe = useCallback(
    (e) => {
      const swipe = swipeRef.current
      if (!swipe.active || (e && swipe.pointerId !== e.pointerId)) return

      const dx = swipe.dx
      swipe.active = false
      swipe.pointerId = null

      if (swipe.vertical) {
        swipe.vertical = false
        if ((swipe.dy || 0) > 90) {
          swipe.swiped = true
          closeLightbox()
        }
        swipe.dy = 0
        return
      }

      if (swipe.locked && Math.abs(dx) >= SWIPE_MIN_PX) {
        swipe.swiped = true
        go(dx < 0 ? 1 : -1)
        return
      }

      setDragX(0)
    },
    [go, closeLightbox],
  )

  const onPointerUp = useCallback(
    (e) => {
      finishSwipe(e)
    },
    [finishSwipe],
  )

  const onPointerCancel = useCallback(() => {
    resetSwipe()
  }, [resetSwipe])

  // Two-finger swipe on a trackpad (horizontal wheel) moves to the next / previous photo
  useEffect(() => {
    if (!lightboxOpen || count <= 1) return undefined
    let acc = 0
    let lockUntil = 0
    let resetTimer = 0
    function onWheel(e) {
      if (zoom > 1) return
      const dx = e.deltaX
      if (Math.abs(dx) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      const now = Date.now()
      window.clearTimeout(resetTimer)
      resetTimer = window.setTimeout(() => {
        acc = 0
      }, 180)
      if (now < lockUntil) return
      acc += dx
      if (Math.abs(acc) >= 50) {
        go(acc > 0 ? 1 : -1)
        acc = 0
        lockUntil = now + 450
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.clearTimeout(resetTimer)
    }
  }, [lightboxOpen, count, zoom, go])

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
    // Probe the optimized lightbox size so ratio matches what we show.
    probe.src = optimizeImageUrl(activeSrc, 'lightbox') || activeSrc
    return () => {
      cancelled = true
    }
  }, [activeSrc])

  // Warm mosaic tiles + adjacent lightbox frames for snappy browsing.
  useEffect(() => {
    if (!count) return undefined
    const warm = []
    const hero = optimizeImageUrl(normalizedImages[0], 'mosaicHero')
    if (hero) warm.push(hero)
    normalizedImages.slice(1, 1 + MOSAIC_SIDE).forEach((src) => {
      const tile = optimizeImageUrl(src, 'mosaicTile')
      if (tile) warm.push(tile)
    })
    warm.forEach((href) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = href
    })
    return undefined
  }, [count, normalizedImages])

  useEffect(() => {
    if (!lightboxOpen || !count) return undefined
    const neighbors = [
      normalizedImages[(activeIndex + 1) % count],
      normalizedImages[(activeIndex - 1 + count) % count],
    ]
    neighbors.forEach((src) => {
      if (!src) return
      const img = new Image()
      img.decoding = 'async'
      img.src = optimizeImageUrl(src, 'lightbox') || src
    })
    return undefined
  }, [activeIndex, count, lightboxOpen, normalizedImages])

  const mosaicSide = useMemo(() => {
    if (count <= 1) return []
    return normalizedImages.slice(1, 1 + MOSAIC_SIDE)
  }, [normalizedImages, count])

  const extraCount = Math.max(0, count - (1 + mosaicSide.length))
  const showMoreOnLast = extraCount > 0 && mosaicSide.length === MOSAIC_SIDE
  const mosaicCount = Math.min(count, 1 + MOSAIC_SIDE)
  const imageTransform =
    zoom > 1
      ? `scale(${zoom})`
      : dragX
        ? `translate3d(${dragX}px, 0, 0) scale(1)`
        : 'scale(1)'

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
          <OptimizedImage
            src={normalizedImages[0]}
            alt={`${title} — photo 1 of ${count}`}
            preset="mosaicHero"
            className="gallery__mosaic-img"
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 820px) 96vw, min(920px, 68vw)"
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
              onClick={() => openLightboxAt(index)}
              aria-label={
                showMore
                  ? `Open gallery — ${extraCount + 1} more photos`
                  : `Open preview — photo ${index + 1} of ${count}`
              }
            >
              <OptimizedImage
                src={src}
                alt=""
                preset="mosaicTile"
                className="gallery__mosaic-img"
                loading="lazy"
                fetchPriority="low"
                sizes="(max-width: 820px) 46vw, min(280px, 18vw)"
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
                <X size={17} strokeWidth={1.4} aria-hidden />
              </button>

              <p className="gallery-lightbox__title">{title}</p>
              <div className="gallery-lightbox__chrome" onClick={(e) => e.stopPropagation()}>
                <div
                  className={`gallery-lightbox__stage${count > 1 && zoom <= 1 ? ' is-swipeable' : ''}${
                    dragX ? ' is-dragging' : ''
                  }`}
                  style={{'--gallery-ratio': String(frameRatio)}}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerCancel}
                >
                  {count > 1 ? (
                    <button
                      type="button"
                      className="gallery-lightbox__nav gallery-lightbox__nav--prev"
                      onClick={() => go(-1)}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={17} strokeWidth={1.4} />
                    </button>
                  ) : null}

                  <div className={`gallery-lightbox__frame ${zoom > 1 ? 'is-zoomed' : ''}`}>
                    <OptimizedImage
                      key={activeSrc}
                      noSrcSet
                      src={activeSrc}
                      alt={`${title} — photo ${activeIndex + 1} of ${count}`}
                      preset="lightbox"
                      className="gallery-lightbox__image"
                      style={{transform: imageTransform}}
                      loading="eager"
                      fetchPriority="high"
                      sizes="(max-width: 900px) 96vw, min(1280px, 92vw)"
                      draggable={false}
                      onClick={() => {
                        if (swipeRef.current.swiped) {
                          swipeRef.current.swiped = false
                          return
                        }
                        if (Math.abs(swipeRef.current.dx) > 8) return
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
                      <ChevronRight size={17} strokeWidth={1.4} />
                    </button>
                  ) : null}
                </div>

                {count > 1 ? (
                  <p className="gallery-lightbox__hint" aria-hidden>
                    {activeIndex + 1} / {count}
                  </p>
                ) : null}

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
                        <OptimizedImage
                          src={image}
                          alt=""
                          preset="lightboxThumb"
                          loading={Math.abs(index - activeIndex) <= 2 ? 'eager' : 'lazy'}
                          sizes="96px"
                        />
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
