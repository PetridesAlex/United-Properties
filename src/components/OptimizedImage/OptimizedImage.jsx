import {useEffect, useMemo, useRef, useState} from 'react'
import {optimizeImageSrcSet, optimizeImageUrl} from '../../lib/media/optimizeImageUrl'

/**
 * Listing image with resized CDN URL, responsive srcSet, and original fallback.
 * Renders at full opacity — no grey wash while loading.
 */
function OptimizedImage({
  src = '',
  alt = '',
  preset = 'card',
  sizes,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  draggable = false,
  onLoad,
  onError,
  ...rest
}) {
  const imgRef = useRef(null)
  const optimized = useMemo(() => optimizeImageUrl(src, preset), [src, preset])
  const srcSet = useMemo(() => optimizeImageSrcSet(src, preset), [src, preset])
  const [currentSrc, setCurrentSrc] = useState(optimized || src)
  const [failedOptimized, setFailedOptimized] = useState(false)

  useEffect(() => {
    setFailedOptimized(false)
    setCurrentSrc(optimizeImageUrl(src, preset) || src)
  }, [optimized, preset, src])

  if (!src) return null

  const showSrcSet = !failedOptimized && srcSet && currentSrc === optimized && optimized !== src

  return (
    <img
      {...rest}
      ref={imgRef}
      src={currentSrc || src}
      srcSet={showSrcSet ? srcSet : undefined}
      sizes={showSrcSet ? sizes : undefined}
      alt={alt}
      className={`optimized-image ${className}`.trim()}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      draggable={draggable}
      onLoad={(event) => {
        onLoad?.(event)
      }}
      onError={(event) => {
        if (!failedOptimized && optimized && currentSrc === optimized && src && src !== optimized) {
          setFailedOptimized(true)
          setCurrentSrc(src)
          return
        }
        onError?.(event)
      }}
    />
  )
}

export default OptimizedImage
