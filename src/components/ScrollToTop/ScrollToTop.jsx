import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return undefined
    }

    // Route chunks load lazily, so wait for the anchor to exist before scrolling.
    const id = decodeURIComponent(hash.slice(1))
    let attempts = 0
    let timer
    const tryScroll = () => {
      const el = document.getElementById(id)
      if (el) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
        return
      }
      attempts += 1
      if (attempts < 30) timer = window.setTimeout(tryScroll, 100)
    }
    timer = window.setTimeout(tryScroll, 60)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}

export default ScrollToTop
