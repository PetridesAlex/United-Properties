import {useEffect, useState} from 'react'
import GlitterWarp from '../GlitterWarp/GlitterWarp'
import '../GlitterWarp/GlitterWarp.css'
import './AdminEntryLoader.css'

const DEFAULT_STEPS = [
  'Securing your session…',
  'Loading your workspace…',
  'Preparing your dashboard…',
  'Almost there…',
]

type AdminEntryLoaderProps = {
  durationMs?: number
  subtitle?: string
  steps?: string[]
}

export default function AdminEntryLoader({
  durationMs = 4000,
  subtitle = 'Opening staff dashboard',
  steps = DEFAULT_STEPS,
}: AdminEntryLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (steps.length <= 1) return
    const interval = Math.max(durationMs / steps.length, 700)
    const id = window.setInterval(() => {
      setStepIndex((current) => (current + 1 < steps.length ? current + 1 : current))
    }, interval)
    return () => window.clearInterval(id)
  }, [durationMs, steps])

  return (
    <div className="admin-entry" role="status" aria-live="polite" aria-busy="true">
      <GlitterWarp
        className="admin-entry__glitter"
        width="100%"
        height="100%"
        speed={1.1}
        color="#d5b59a"
        density={14}
        brightness={1.35}
        starSize={0.11}
        turbulence={0.35}
        focalDepth={0.03}
      />
      <div className="admin-entry__overlay" aria-hidden="true" />

      <div className="admin-entry__panel">
        <img
          src="/images/logo/United_Properties_v2.1.svg"
          alt="United Properties"
          className="admin-entry__logo"
        />
        <p className="admin-entry__eyebrow">{subtitle}</p>
        <p className="admin-entry__step">{steps[stepIndex]}</p>

        <div className="admin-entry__progress-track" aria-hidden="true">
          <span
            className="admin-entry__progress-bar"
            style={{animationDuration: `${durationMs}ms`}}
          />
        </div>
      </div>
    </div>
  )
}
