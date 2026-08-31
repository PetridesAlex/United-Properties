import {useEffect, useState} from 'react'

export const AGENT_QUOTES = [
  'What Are We Selling Today?',
  'Every Listing Has A Story — Tell It Well.',
  'Luxury Is Clarity, Care, And Confidence.',
  'Find The Right Home For The Right Client.',
  'Details Close Deals. Polish Everything.',
  'A Great Viewing Starts Before The Door Opens.',
  'Listen First. Then Recommend The Perfect Fit.',
  'Cyprus Shines — Show Them Why It Matters.',
  'Turn Enquiries Into Appointments Today.',
  'Premium Service Is The Real Difference.',
  'Make Every Photo Earn Its Place.',
  'Relationships Outlast Any Single Sale.',
  'Price With Confidence. Present With Pride.',
  'One Thoughtful Follow-Up Can Change Everything.',
  'Sell The Lifestyle, Not Just The Square Metres.',
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
