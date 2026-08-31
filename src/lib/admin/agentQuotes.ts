import {useEffect, useState} from 'react'

export const AGENT_QUOTES = [
  'What are we selling today?',
  'Every listing has a story — tell it well.',
  'Luxury is clarity, care, and confidence.',
  'Find the right home for the right client.',
  'Details close deals. Polish everything.',
  'A great viewing starts before the door opens.',
  'Listen first. Then recommend the perfect fit.',
  'Cyprus shines — show them why it matters.',
  'Turn enquiries into appointments today.',
  'Premium service is the real difference.',
  'Make every photo earn its place.',
  'Relationships outlast any single sale.',
  'Price with confidence. Present with pride.',
  'One thoughtful follow-up can change everything.',
  'Sell the lifestyle, not just the square metres.',
] as const

export function useAgentQuote(intervalMs = 7200) {
  const [index, setIndex] = useState(() => {
    const day = Math.floor(Date.now() / 86_400_000)
    return day % AGENT_QUOTES.length
  })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % AGENT_QUOTES.length)
      setTick((n) => n + 1)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return {quote: AGENT_QUOTES[index], tick}
}
