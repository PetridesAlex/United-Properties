import { useEffect, useRef, useState } from 'react'
import './SitePreloader.css'

const MIN_MS = 2200
/** Must match `.site-preloader--exit` animation duration in CSS */
const EXIT_MS = 780
const EXIT_MS_REDUCED = 420

function waitForWindowLoad() {
  if (typeof document === 'undefined') return Promise.resolve()
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    window.addEventListener('load', resolve, { once: true })
  })
}

function waitMs(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Full-viewport first paint: luxury editorial reveal, then hands off to the app.
 */
function SitePreloader({ onDone }) {
  const [phase, setPhase] = useState('enter')
  const exitTimerRef = useRef(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    let cancelled = false

    const run = async () => {
      await Promise.all([waitForWindowLoad(), waitMs(MIN_MS)])
      if (cancelled) return
      setPhase('exit')
      const exitMs =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? EXIT_MS_REDUCED
          : EXIT_MS
      exitTimerRef.current = window.setTimeout(() => {
        document.body.style.overflow = prevOverflow || ''
        doneRef.current?.()
      }, exitMs)
    }

    const id = requestAnimationFrame(() => {
      setPhase('active')
    })
    run()

    return () => {
      cancelled = true
      cancelAnimationFrame(id)
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current)
      document.body.style.overflow = prevOverflow || ''
    }
  }, [])

  const rootClass = [
    'site-preloader',
    phase === 'enter' && 'site-preloader--enter',
    (phase === 'active' || phase === 'exit') && 'site-preloader--active',
    phase === 'exit' && 'site-preloader--exit',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rootClass}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={phase === 'exit' ? 100 : phase === 'active' ? 50 : 0}
      aria-label="Loading site"
    >
      <div className="site-preloader__ambient" aria-hidden="true" />
      <div className="site-preloader__vignette" aria-hidden="true" />
      <div className="site-preloader__grain" aria-hidden="true" />

      <div className="site-preloader__content">
        <div className="site-preloader__frame" aria-hidden="true">
          <span className="site-preloader__frame-corner site-preloader__frame-corner--tl" />
          <span className="site-preloader__frame-corner site-preloader__frame-corner--tr" />
          <span className="site-preloader__frame-corner site-preloader__frame-corner--bl" />
          <span className="site-preloader__frame-corner site-preloader__frame-corner--br" />
        </div>

        <div className="site-preloader__brand">
          <div className="site-preloader__logo-wrap">
            <img
              className="site-preloader__logo"
              src="/images/logo/United_Properties_v2.1.svg"
              alt=""
              width={335}
              height={355}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="site-preloader__track" aria-hidden="true">
          <div className="site-preloader__track-groove" />
          <div className="site-preloader__bar">
            <span className="site-preloader__bar-sheen" />
          </div>
          <div className="site-preloader__bar-glow" />
        </div>
      </div>
    </div>
  )
}

export default SitePreloader
