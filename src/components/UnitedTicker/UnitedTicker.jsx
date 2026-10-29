import './UnitedTicker.css'

/**
 * Sliding bar at the very top of the site (above the header and menu).
 * The words are repeated 4 times so the loop is seamless (the animation moves exactly one copy: -25%).
 * Change the words in WORDS only.
 */
const WORDS = [
  'BOUTIQUE PORTFOLIO',
  'INVESTMENT ADVISORY',
  'RELOCATION',
  'OFF-MARKET PROPERTIES',
  'INTERNATIONAL PRIVATE CLIENTS',
]

export default function UnitedTicker() {
  const items = []
  for (let copy = 0; copy < 4; copy += 1) {
    WORDS.forEach((w) => {
      items.push(<span key={`${copy}-${w}`}>{w}</span>)
      items.push(<i key={`${copy}-${w}-dot`} />)
    })
  }
  return (
    <div className="up-ticker" aria-hidden="true">
      <div className="up-tk">{items}</div>
    </div>
  )
}
