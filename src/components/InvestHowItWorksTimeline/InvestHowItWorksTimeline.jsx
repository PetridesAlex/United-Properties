import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Calculator,
  DraftingCompass,
  Handshake,
  MapPinned,
  Scale,
  TrendingUp,
} from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import './InvestHowItWorksTimeline.css'

const STEP_ICONS = [MapPinned, DraftingCompass, Calculator, TrendingUp, Scale, Handshake]

const STEP_DEFAULTS = [
  {
    title: 'We discover the right plot',
    copy:
      'We source and evaluate land in locations with real demand and long‑term potential, checking planning zones, density and access so the foundations are right from day one.',
  },
  {
    title: 'We shape the concept with our partners',
    copy:
      'Working closely with our architects and engineers, we define what should be built on the plot – from unit mix to overall design – ensuring it fits both regulations and future buyers or tenants.',
  },
  {
    title: 'We build a realistic budget',
    copy:
      'With input from our construction partners, we translate the concept into a detailed cost plan, including construction, professional fees, permits and contingencies, so you see the full picture of what the project will require.',
  },
  {
    title: 'We map the market and returns',
    copy:
      'Using local comparables and current demand, we estimate selling prices or rentals and project the potential income of the finished development, including expected ROI and time horizon.',
  },
  {
    title: 'We design the investment structure',
    copy:
      'Together with our legal partners, we propose a structure that suits your profile – whether that is a private investment, joint venture or dedicated SPV – always with clarity around roles, responsibilities and exit.',
  },
  {
    title: 'We coordinate the journey, together',
    copy:
      'Once you decide to move forward, United Properties stands at the centre, coordinating legal, technical and construction teams and keeping everyone aligned. All key partners are united under one boutique umbrella, so your path from land to completed asset is as smooth and transparent as possible.',
  },
]

function Node({ progress, at, Icon }) {
  const start = Math.max(0, at - 0.12)
  const mid = Math.min(1, at + 0.02)
  const scale = useTransform(progress, [start, mid], [0.6, 1])
  const opacity = useTransform(progress, [start, mid], [0.25, 1])
  const ringOpacity = useTransform(progress, [start, mid], [0, 1])
  const [reached, setReached] = useState(false)

  useMotionValueEvent(progress, 'change', (v) => {
    setReached(v >= mid - 0.001)
  })

  return (
    <div className="invest-how-it-works__node-ring">
      <span className="invest-how-it-works__node-base" aria-hidden />
      <motion.span
        style={{ opacity: ringOpacity }}
        className="invest-how-it-works__node-ring-glow"
        aria-hidden
      />
      {reached && (
        <motion.span
          aria-hidden
          className="invest-how-it-works__node-pulse"
          initial={{ scale: 1, opacity: 0.45 }}
          animate={{ scale: 1.85, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <motion.span
        style={{ scale, opacity }}
        animate={
          reached
            ? {
                backgroundColor: 'rgba(191, 152, 117, 0.95)',
                color: 'rgb(255, 255, 255)',
              }
            : {}
        }
        transition={{ duration: 0.35 }}
        className="invest-how-it-works__node-icon-shell"
      >
        <Icon className="invest-how-it-works__node-icon" aria-hidden strokeWidth={2} />
      </motion.span>
    </div>
  )
}

function TimelineCard({ step, side }) {
  const Icon = step.icon

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-18%' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`invest-how-it-works__card card-luxury invest-how-it-works__card--${side}`}
    >
      <div className="invest-how-it-works__card-inner">
        <span className="invest-how-it-works__card-icon" aria-hidden>
          <Icon size={18} strokeWidth={2} />
        </span>
        <h3 className="invest-how-it-works__card-title">{step.title}</h3>
        <p className="invest-how-it-works__card-copy">{step.copy}</p>
      </div>
      <div className="invest-how-it-works__card-media">
        <div className="invest-how-it-works__card-aspect">
          <div className="invest-how-it-works__card-placeholder">
            <span className="invest-how-it-works__card-placeholder-label">Insert image</span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function InvestHowItWorksTimeline() {
  const { get } = useSiteContent()
  const ref = useRef(null)
  const firstNodeRef = useRef(null)
  const lastNodeRef = useRef(null)
  const scrollYProgress = useMotionValue(0)
  const [lineBounds, setLineBounds] = useState({ top: 0, height: 0 })

  const steps = useMemo(
    () =>
      STEP_DEFAULTS.map((fallback, index) => {
        const n = index + 1
        return {
          title: get('services', 'invest_process', `step${n}_title`, fallback.title),
          copy: get('services', 'invest_process', `step${n}_body`, fallback.copy),
          icon: STEP_ICONS[index],
        }
      }),
    [get],
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0

    const tick = () => {
      const container = ref.current
      const first = firstNodeRef.current
      const last = lastNodeRef.current
      if (container && first && last) {
        const win = container.ownerDocument.defaultView ?? window
        const vh = win.innerHeight || container.ownerDocument.documentElement.clientHeight
        const containerRect = container.getBoundingClientRect()
        const firstRect = first.getBoundingClientRect()
        const lastRect = last.getBoundingClientRect()

        const firstCenterY = firstRect.top + firstRect.height / 2
        const lastCenterY = lastRect.top + lastRect.height / 2

        const activate = vh * 0.55

        const span = lastCenterY - firstCenterY
        if (span > 0) {
          const p = (activate - firstCenterY) / span
          scrollYProgress.set(Math.min(1, Math.max(0, p)))
        }

        const top = firstCenterY - containerRect.top
        const height = lastCenterY - firstCenterY
        setLineBounds((prev) => (prev.top === top && prev.height === height ? prev : { top, height }))
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scrollYProgress])

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const maxIndex = Math.max(1, steps.length - 1)

  return (
    <div className="invest-how-it-works" aria-labelledby="invest-how-heading">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="invest-how-it-works__eyebrow"
      >
        {get('services', 'invest_process', 'eyebrow', 'Process')}
      </motion.p>

      <motion.h2
        id="invest-how-heading"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="invest-how-it-works__title"
      >
        {get('services', 'invest_process', 'heading', 'How it works')}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="invest-how-it-works__lead"
      >
        {get(
          'services',
          'invest_process',
          'lead',
          'From land sourcing to coordinated delivery—six deliberate stages with one boutique team at the centre.',
        )}
      </motion.p>

      <div ref={ref} className="invest-how-it-works__track">
        <div
          aria-hidden
          style={{ top: lineBounds.top, height: Math.max(0, lineBounds.height) }}
          className="invest-how-it-works__line invest-how-it-works__line--track"
        />
        <motion.div
          aria-hidden
          style={{
            top: lineBounds.top,
            height: Math.max(0, lineBounds.height),
            scaleY: lineScale,
            transformOrigin: 'top center',
          }}
          className="invest-how-it-works__line invest-how-it-works__line--fill"
        />

        <div className="invest-how-it-works__steps">
          {steps.map((step, i) => {
            const side = i % 2 === 0 ? 'left' : 'right'
            const at = i / maxIndex
            const isFirst = i === 0
            const isLast = i === steps.length - 1
            return (
              <div key={`invest-step-${i}`} className="invest-how-it-works__step-row">
                <div
                  ref={isFirst ? firstNodeRef : isLast ? lastNodeRef : undefined}
                  className="invest-how-it-works__step-node"
                >
                  <Node progress={scrollYProgress} at={at} Icon={step.icon} />
                </div>
                <div className="invest-how-it-works__step-card-wrap">
                  <TimelineCard step={step} side={side} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
