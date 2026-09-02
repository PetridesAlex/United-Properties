import { useCountUp } from '../../hooks/useCountUp'

/** Displays a key-fact value with optional count-up when `active`. */
function AnimatedStatValue({ value, active = false, duration = 1100, className = 'property-details__stat-value' }) {
  const { display, finalLabel } = useCountUp(value, { enabled: active, duration })

  return (
    <span className={className} aria-label={finalLabel}>
      {display}
    </span>
  )
}

export default AnimatedStatValue
