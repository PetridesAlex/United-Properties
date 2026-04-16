import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { useTheme } from 'next-themes'
import './center-flow.css'

const BASE_GLOW = 40
const FADE_THRESHOLD = 0.15

const DARK_BG = '#0a0a0a'
const LIGHT_BG = '#ffffff'

const generateNodePositions = (count, distance) => {
  const clampedCount = Math.max(2, Math.min(14, count))
  const nodes = new Array(clampedCount)
  const angleStep = (Math.PI * 2) / clampedCount
  const radius = distance * 45

  for (let i = 0; i < clampedCount; i++) {
    const angle = i * angleStep - Math.PI / 2
    nodes[i] = {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    }
  }
  return nodes
}

const generatePathD = (from, to) => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  return `M ${from.x} ${from.y} C ${from.x + dx * 0.4} ${from.y + dy * 0.1}, ${from.x + dx * 0.6} ${to.y - dy * 0.1}, ${to.x} ${to.y}`
}

const DEFAULT_NODE_ITEMS = Array.from({ length: 8 }, () => ({}))

function CenterFlow({
  nodeItems = DEFAULT_NODE_ITEMS,
  centerContent,
  centerSize = 120,
  nodeSize = 60,
  pulseDuration = 5,
  pulseInterval = 10,
  pulseLength = 0.4,
  lineWidth = 2,
  pulseWidth = 1,
  pulseSoftness = 10,
  lineColor = 'rgba(255, 255, 255, 0.22)',
  lineColorLight = '#c8c8d0',
  pulseColor = '#e724eb',
  pulseColorLight = '#e724eb',
  glowColor = '#e724eb',
  glowColorLight = '#e724eb',
  maxGlowIntensity = 25,
  glowDecay = 0.95,
  borderRadius = 35,
  nodeDistance = 0.7,
  disableBlinking = false,
  className = '',
  /** When the block sits on a white surface but the site theme is dark, set to "light". */
  surface = 'auto',
  /** Overrides center square background (e.g. dark gradient so light logos read clearly). */
  centerBackground,
  /** Extra class on the center hub (e.g. luxury border/glow overrides from CSS). */
  centerClassName = '',
  /** Softer animated glow + pulse buildup (editorial / luxury layouts). */
  subtleGlow = false,
  /** Multiplier for traveling pulse visibility (0–1). */
  pulseStrength = 1,
}) {
  const containerRef = useRef(null)
  const glowRef = useRef(null)
  const glowIntensityRef = useRef(0)
  const pathCacheRef = useRef(new Map())

  const { resolvedTheme } = useTheme()
  const isLight =
    surface === 'light'
      ? true
      : surface === 'dark'
        ? false
        : resolvedTheme === 'light'

  const activeLineColor = isLight ? lineColorLight : lineColor
  const activePulseColor = isLight ? pulseColorLight : pulseColor
  const activeGlowColor = isLight ? glowColorLight : glowColor

  const nodeBgColor = isLight ? LIGHT_BG : DARK_BG
  const centerBgColor = isLight ? LIGHT_BG : DARK_BG

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [pulses, setPulses] = useState([])
  const [pulseSegments, setPulseSegments] = useState([])

  const nodeCount = Math.max(2, Math.min(14, nodeItems.length))

  const nodes = useMemo(
    () => generateNodePositions(nodeCount, nodeDistance),
    [nodeCount, nodeDistance],
  )

  const center = useMemo(
    () => ({
      x: dimensions.width / 2,
      y: dimensions.height / 2,
    }),
    [dimensions],
  )

  const nodePositions = useMemo(
    () =>
      nodes.map((node) => ({
        x: (node.x / 100) * dimensions.width,
        y: (node.y / 100) * dimensions.height,
      })),
    [nodes, dimensions],
  )

  const softness = pulseSoftness / 10
  const tailStop = softness * 30
  const headStop = 100 - softness * 20

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const onPulseArrive = useCallback(() => {
    if (disableBlinking) return
    const boost = subtleGlow ? 0.28 : 0.6
    const cap = subtleGlow ? maxGlowIntensity * 0.42 : maxGlowIntensity
    glowIntensityRef.current = Math.min(
      glowIntensityRef.current + maxGlowIntensity * boost,
      cap,
    )
  }, [maxGlowIntensity, disableBlinking, subtleGlow])

  useEffect(() => {
    let frameId
    const updateGlow = () => {
      if (glowRef.current) {
        const dynamicIntensity = glowIntensityRef.current
        const base = subtleGlow ? BASE_GLOW * 0.42 : BASE_GLOW
        const totalIntensity = base + dynamicIntensity
        const spread = totalIntensity * (subtleGlow ? 0.55 : 0.8)
        const blur = totalIntensity * (subtleGlow ? 0.95 : 1.5)
        const alpha = Math.min(255, Math.floor(totalIntensity * (subtleGlow ? 2.2 : 4)))
          .toString(16)
          .padStart(2, '0')

        if (subtleGlow) {
          glowRef.current.style.boxShadow = `0 0 ${blur}px ${spread}px ${activeGlowColor}18, 0 0 ${blur * 1.6}px ${spread * 1.1}px ${activeGlowColor}0c, inset 0 0 ${blur * 0.35}px ${activeGlowColor}12`
        } else {
          glowRef.current.style.boxShadow = `0 0 ${blur}px ${spread}px ${activeGlowColor}40, 0 0 ${blur * 2}px ${spread * 1.5}px ${activeGlowColor}20, inset 0 0 ${blur * 0.5}px ${activeGlowColor}30`
        }
        glowRef.current.style.borderColor = `${activeGlowColor}${alpha}`

        glowIntensityRef.current =
          dynamicIntensity > 0.5 ? dynamicIntensity * glowDecay : 0
      }
      frameId = requestAnimationFrame(updateGlow)
    }
    frameId = requestAnimationFrame(updateGlow)
    return () => cancelAnimationFrame(frameId)
  }, [activeGlowColor, glowDecay, subtleGlow])

  useEffect(() => {
    const timeouts = []

    const spawnPulseForPath = (pathIndex) => {
      setPulses((prev) => [
        ...prev,
        {
          id: `${pathIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          pathIndex,
          startTime: Date.now(),
        },
      ])
      const timeout = setTimeout(
        () => spawnPulseForPath(pathIndex),
        pulseInterval * 1000 * (0.7 + Math.random() * 0.6),
      )
      timeouts.push(timeout)
    }

    nodePositions.forEach((_, pathIndex) => {
      const timeout = setTimeout(
        () => spawnPulseForPath(pathIndex),
        Math.random() * pulseInterval * 1000,
      )
      timeouts.push(timeout)
    })

    return () => timeouts.forEach(clearTimeout)
  }, [nodePositions, pulseInterval])

  useEffect(() => {
    let frameId
    const duration = pulseDuration * 1000

    const animate = () => {
      const now = Date.now()
      setPulses((prev) =>
        prev.filter((pulse) => {
          if ((now - pulse.startTime) / duration >= 1) {
            onPulseArrive()
            return false
          }
          return true
        }),
      )
      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [pulseDuration, onPulseArrive])

  useEffect(() => {
    pathCacheRef.current.clear()
  }, [nodePositions, center])

  useEffect(() => {
    let frameId
    const duration = pulseDuration * 1000

    const calculateSegments = () => {
      const now = Date.now()
      const segments = []

      for (const pulse of pulses) {
        const from = nodePositions[pulse.pathIndex]
        if (!from) continue

        let path = pathCacheRef.current.get(pulse.pathIndex)
        if (!path) {
          path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          path.setAttribute('d', generatePathD(from, center))
          pathCacheRef.current.set(pulse.pathIndex, path)
        }

        const progress = Math.min((now - pulse.startTime) / duration, 1)
        if (progress <= 0 || progress >= 1) continue

        const length = path.getTotalLength()
        const headPos = progress
        const tailPos = Math.max(0, progress - pulseLength)

        const points = []
        for (let i = 0; i <= 8; i++) {
          const point = path.getPointAtLength(
            length * (tailPos + (headPos - tailPos) * (i / 8)),
          )
          points.push({ x: point.x, y: point.y })
        }

        if (points.length < 2) continue

        const opacity =
          Math.min(1, progress / FADE_THRESHOLD) *
          Math.min(1, (1 - progress) / FADE_THRESHOLD)

        segments.push({
          id: pulse.id,
          d:
            `M ${points[0].x} ${points[0].y}` +
            points
              .slice(1)
              .map((p) => ` L ${p.x} ${p.y}`)
              .join(''),
          opacity,
          startPoint: points[0],
          endPoint: points[points.length - 1],
        })
      }

      setPulseSegments(segments)
      frameId = requestAnimationFrame(calculateSegments)
    }

    frameId = requestAnimationFrame(calculateSegments)
    return () => cancelAnimationFrame(frameId)
  }, [pulses, nodePositions, center, pulseDuration, pulseLength])

  const nodeStyle = useMemo(
    () => ({
      borderRadius: borderRadius * 0.6,
      background: nodeBgColor,
      backdropFilter: 'blur(8px)',
      border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: isLight
        ? '0 2px 8px rgba(0,0,0,0.1)'
        : '0 2px 8px rgba(0,0,0,0.3)',
    }),
    [borderRadius, isLight, nodeBgColor],
  )

  const centerStyle = useMemo(
    () => ({
      left: center.x,
      top: center.y,
      width: centerSize,
      height: centerSize,
      borderRadius,
      background: centerBackground ?? centerBgColor,
      backdropFilter: centerBackground ? 'none' : 'blur(12px)',
      border: subtleGlow
        ? `1px solid ${activeGlowColor}28`
        : `2px solid ${activeGlowColor}35`,
      boxShadow: subtleGlow
        ? `0 0 28px 4px ${activeGlowColor}12, inset 0 1px 0 rgba(255,255,255,0.06)`
        : `0 0 20px 5px ${activeGlowColor}18`,
    }),
    [
      center.x,
      center.y,
      centerSize,
      borderRadius,
      centerBgColor,
      activeGlowColor,
      centerBackground,
      subtleGlow,
    ],
  )

  const containerClassName = className
    ? `center-flow-container ${className}`
    : 'center-flow-container'

  const defaultCenterContent = (
    <div
      className="center-flow-icon-wrapper"
      style={{ width: centerSize * 0.5, height: centerSize * 0.5 }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="center-flow-icon"
        style={{ color: activePulseColor }}
      >
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )

  const defaultNodeContent = (
    <div
      className="center-flow-node-dot"
      style={{
        background: `${activePulseColor}40`,
        boxShadow: `0 0 8px ${activePulseColor}30`,
      }}
    />
  )

  return (
    <div ref={containerRef} className={containerClassName}>
      <svg className="center-flow-svg" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {pulseSegments.map((segment) => (
            <linearGradient
              key={`grad-${segment.id}`}
              id={`pulse-grad-${segment.id}`}
              x1={segment.startPoint.x}
              y1={segment.startPoint.y}
              x2={segment.endPoint.x}
              y2={segment.endPoint.y}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={activePulseColor} stopOpacity="0" />
              <stop
                offset={`${tailStop}%`}
                stopColor={activePulseColor}
                stopOpacity="1"
              />
              <stop
                offset={`${headStop}%`}
                stopColor={activePulseColor}
                stopOpacity="1"
              />
              <stop
                offset="100%"
                stopColor={activePulseColor}
                stopOpacity="0"
              />
            </linearGradient>
          ))}
        </defs>

        {nodePositions.map((node, i) => (
          <path
            key={i}
            d={generatePathD(node, center)}
            fill="none"
            stroke={activeLineColor}
            strokeWidth={lineWidth}
            strokeLinecap="round"
          />
        ))}

        {pulseSegments.map((segment) => (
          <g key={segment.id}>
            <path
              d={segment.d}
              fill="none"
              stroke={`url(#pulse-grad-${segment.id})`}
              strokeWidth={pulseWidth * 3}
              strokeLinecap="round"
              opacity={segment.opacity * 0.55 * pulseStrength}
              filter="url(#pulseGlow)"
            />
            <path
              d={segment.d}
              fill="none"
              stroke={`url(#pulse-grad-${segment.id})`}
              strokeWidth={pulseWidth}
              strokeLinecap="round"
              opacity={segment.opacity * pulseStrength}
            />
          </g>
        ))}
      </svg>

      {nodePositions.map((node, i) => {
        const nodeItem = nodeItems[i]
        const hasCustomContent = nodeItem?.content !== undefined

        return (
          <div
            key={i}
            className="center-flow-node"
            style={{
              left: node.x,
              top: node.y,
              width: nodeSize,
              height: nodeSize,
              ...nodeStyle,
            }}
          >
            {hasCustomContent ? nodeItem.content : defaultNodeContent}
          </div>
        )
      })}

      <div
        ref={glowRef}
        className={
          centerClassName
            ? `center-flow-center ${centerClassName}`
            : 'center-flow-center'
        }
        style={centerStyle}
      >
        {centerContent !== undefined ? centerContent : defaultCenterContent}
      </div>
    </div>
  )
}

CenterFlow.displayName = 'CenterFlow'

export default CenterFlow
