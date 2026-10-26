import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import './ServicesHeroSwitcher.css'

const ROTATE_MS = 4800

const SERVICE_DEFAULTS = [
  {
    key: 'invest',
    href: '#invest-with-us',
    index: '01',
    title: 'Invest with us',
    line: 'We choose potential over volume.',
    body: 'Packages, land, apartments, and homes — each opportunity built around clear numbers and real local knowledge.',
  },
  {
    key: 'sell',
    href: '#sell-with-us',
    index: '02',
    title: 'Sell with us',
    line: 'Not just sold. Sold right.',
    body: 'A fair price, presentation that earns attention, screened buyers, and guidance through to completion.',
  },
  {
    key: 'manage',
    href: '#property-management',
    index: '03',
    title: 'Property management',
    line: 'Let your property work for you.',
    body: 'Two plans, one standard of care — from rental placement to full hands-free management.',
  },
]

function ServicesHeroSwitcher() {
  const { get } = useSiteContent()
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const services = SERVICE_DEFAULTS.map((item) => ({
    ...item,
    title: get('services', 'hero_switch', `${item.key}_title`, item.title),
    line: get('services', 'hero_switch', `${item.key}_line`, item.line),
    body: get('services', 'hero_switch', `${item.key}_body`, item.body),
  }))

  useEffect(() => {
    if (reduceMotion || paused) return undefined
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % services.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused, reduceMotion, services.length])

  const current = services[active]

  function goTo(index) {
    setActive(index)
  }

  function exploreCurrent(event) {
    event.preventDefault()
    const target = document.querySelector(current.href)
    if (target) {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }
  }

  return (
    <div
      className="services-hero-switch"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
    >
      <div className="services-hero-switch__stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            className="services-hero-switch__slide"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="services-hero-switch__index">{current.index}</p>
            <h2 className="services-hero-switch__title">{current.title}</h2>
            <p className="services-hero-switch__line">{current.line}</p>
            <p className="services-hero-switch__body">{current.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="services-hero-switch__nav" role="tablist" aria-label="United Services on this page">
        {services.map((item, index) => {
          const selected = index === active
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`services-hero-switch__tab${selected ? ' is-active' : ''}`}
              onClick={() => goTo(index)}
            >
              <span className="services-hero-switch__tab-index">{item.index}</span>
              <span className="services-hero-switch__tab-label">{item.title}</span>
              {selected && !reduceMotion ? (
                <motion.span
                  className="services-hero-switch__tab-progress"
                  layoutId="services-hero-progress"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                  key={`${item.key}-${active}-${paused ? 'paused' : 'play'}`}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <a
        href={current.href}
        className="services-hero-switch__explore"
        onClick={exploreCurrent}
      >
        <span>Explore {current.title}</span>
        <ArrowDown size={16} strokeWidth={2.1} aria-hidden />
      </a>
    </div>
  )
}

export default ServicesHeroSwitcher
