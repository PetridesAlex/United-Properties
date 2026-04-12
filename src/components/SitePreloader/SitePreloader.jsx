import { useEffect, useRef, useState } from 'react'
import './SitePreloader.css'

/** Short minimum so the reveal does not flash away instantly (sync bar feel with `--sp-duration-bar`). */
const MIN_MS = 900
/** Never wait longer than this for window load; preloader dismisses at most ~MAX_MS + exit animation. */
const MAX_MS = 3000
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
      const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now()
      await Promise.race([waitForWindowLoad(), waitMs(MAX_MS)])
      if (cancelled) return
      const elapsed =
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0
      const remainingMin = Math.max(0, MIN_MS - elapsed)
      const underCap = Math.max(0, MAX_MS - elapsed)
      await waitMs(Math.min(remainingMin, underCap))
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
          <div className="site-preloader__bar" />
        </div>
      </div>
    </div>
  )
}

export default SitePreloader
