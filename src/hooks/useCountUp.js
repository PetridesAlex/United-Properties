import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Parse a countable value; returns null for N/A or non-numeric strings. */
export function parseCountable(value) {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { target: value, prefix: '', suffix: '', decimals: Number.isInteger(value) ? 0 : 1 }
  }

  const str = String(value).trim()
  if (!str || /^n\/?a$/i.test(str)) return null

  const match = str.match(/^([^\d-]*)(-?\d+(?:[.,]\d+)?)(.*)$/)
  if (!match) return null

  const raw = match[2].replace(',', '.')
  const target = Number(raw)
  if (!Number.isFinite(target)) return null

  const decimals = raw.includes('.') ? Math.min(raw.split('.')[1].length, 2) : 0
  return { target, prefix: match[1] || '', suffix: (match[3] || '').trimStart(), decimals }
}

function formatCounted(n, decimals) {
  if (decimals > 0) return n.toFixed(decimals)
  return String(Math.round(n))
}

/**
 * Animates a number from 0 → target when `enabled` becomes true.
 * Keeps the real final value as aria / fallback — never replaces listing data.
 */
export function useCountUp(value, { enabled = true, duration = 1200 } = {}) {
  const parsed = useMemo(() => parseCountable(value), [value])
  const fallback = value == null || value === '' ? 'N/A' : String(value)
  const finalLabel = parsed
    ? `${parsed.prefix}${formatCounted(parsed.target, parsed.decimals)}${parsed.suffix}`
    : fallback

  const [display, setDisplay] = useState(finalLabel)
  const startedForRef = useRef('')
  const rafRef = useRef(0)

  useEffect(() => {
    if (!parsed) {
      setDisplay(fallback)
      startedForRef.current = ''
      return undefined
    }

    if (prefersReducedMotion()) {
      setDisplay(finalLabel)
      return undefined
    }

    if (!enabled) {
      // Wait for in-view — keep real listing value visible (not zeros).
      setDisplay(finalLabel)
      return undefined
    }

    const runKey = `${finalLabel}|${duration}`
    if (startedForRef.current === runKey) {
      setDisplay(finalLabel)
      return undefined
    }
    startedForRef.current = runKey

    const { prefix, suffix, decimals, target: to } = parsed
    setDisplay(`${prefix}${formatCounted(0, decimals)}${suffix}`)

    const start = performance.now()
    const easeOutCubic = (t) => 1 - (1 - t) ** 3

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const current = to * easeOutCubic(t)
      setDisplay(`${prefix}${formatCounted(current, decimals)}${suffix}`)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(finalLabel)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [parsed, fallback, finalLabel, enabled, duration])

  return { display, finalLabel }
}

/**
 * Fires once when the element enters the viewport.
 * Uses a callback ref so it still works when the node mounts after loading.
 */
export function useInViewOnce({ threshold = 0.2, rootMargin = '0px' } = {}) {
  const [node, setNode] = useState(null)
  const [inView, setInView] = useState(false)

  const ref = useCallback((el) => {
    setNode((prev) => (prev === el ? prev : el))
  }, [])

  useEffect(() => {
    if (!node || inView) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, inView, threshold, rootMargin])

  return [ref, inView]
}
