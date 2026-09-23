import { useState, useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import './ModalCards.css'

const MotionDiv = motion.div

/**
 * @typedef {{
 *   id: string
 *   imageUrl: string
 *   title: string
 *   description: string
 *   slug?: string
 *   price?: number
 *   status?: string
 * }} ModalCardItem
 */

const backdropTransition = { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
const cardTransition = { type: 'spring', stiffness: 320, damping: 30 }

const noopSubscribe = () => () => {}

function formatCardPrice(value, status) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  const formatted = new Intl.NumberFormat('en-US').format(amount)
  return status === 'For Rent' ? `EUR ${formatted} / month` : `EUR ${formatted}`
}

/** Break long listing copy into short, scannable paragraphs. */
function splitIntoReadableParagraphs(text) {
  const cleaned = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return []

  const sentences =
    cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || [cleaned]

  const paragraphs = []
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(' '))
  }
  return paragraphs
}

/**
 * Soft-emphasize facts that matter in a listing (counts, price, furnished, etc.)
 * without turning the whole blurb into bold noise.
 */
function renderHighlightedCopy(text, keyPrefix) {
  const pattern =
    /\bEUR\s*[\d,.]+(?:\s*\/\s*month)?\b|\b\d+[\d,]*(?:\.\d+)?\s*(?:bedrooms?|baths?|bathrooms?|floors?|units?|m²|sq\.?\s*m|sqft)\b|\b(?:fully\s+furnished|semi\s+furnished|unfurnished|brand\s+new|newly\s+built|seafront|sea\s+view|private\s+pool|penthouse|covered\s+parking)\b/gi

  const nodes = []
  let lastIndex = 0
  let match
  let i = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    nodes.push(
      <strong key={`${keyPrefix}-m${i}`} className="modal-description__mark">
        {match[0]}
      </strong>,
    )
    i += 1
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes.length ? nodes : text
}

function ModalDescriptionBody({ description }) {
  const paragraphs = splitIntoReadableParagraphs(description)
  if (!paragraphs.length) return null

  return (
    <div className="modal-description__body" id="modal-cards-desc">
      {paragraphs.map((paragraph, index) => (
        <p
          key={`desc-p-${index}`}
          className={
            index === 0
              ? 'modal-description__text modal-description__text--lead'
              : 'modal-description__text'
          }
        >
          {renderHighlightedCopy(paragraph, `p${index}`)}
        </p>
      ))}
    </div>
  )
}

export default function ModalCards({ cards = [], className }) {
  const [selected, setSelected] = useState(/** @type {ModalCardItem | null} */ (null))
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)

  useEffect(() => {
    if (selected) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return undefined
  }, [selected])

  useEffect(() => {
    if (!selected) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  if (!cards.length) {
    return (
      <p className="modal-cards-empty" style={{ padding: '1rem', color: 'var(--color-muted)' }}>
        No featured listings to show.
      </p>
    )
  }

  const selectedPrice = selected ? formatCardPrice(selected.price, selected.status) : null
  const modal = mounted && (
    <AnimatePresence>
      {selected ? (
        <>
          <MotionDiv
            key="backdrop"
            role="presentation"
            aria-hidden
            className={cn('modal-backdrop', 'modal-backdrop-clickable')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={() => setSelected(null)}
          />
          <div
            key={selected.id}
            className="modal-expanded-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-cards-title"
            aria-describedby="modal-cards-desc"
          >
            <MotionDiv
              className="modal-expanded-card"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={cardTransition}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-expanded-image-container">
                <img
                  className="modal-expanded-image"
                  src={selected.imageUrl}
                  alt={selected.title}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  sizes="(max-width: 640px) 96vw, min(72rem, 96vw)"
                />
                <div className="modal-expanded-overlay">
                  <div className="modal-expanded-overlay-content">
                    <div className="modal-expanded-title-block">
                      <h2 id="modal-cards-title" className="modal-expanded-title">
                        {selected.title}
                      </h2>
                      {selectedPrice ? (
                        <p className="modal-expanded-price">{selectedPrice}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="modal-close-button"
                      aria-label="Close"
                      onClick={() => setSelected(null)}
                    >
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path
                          d="M12 4L4 12M4 4L12 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-description">
                <div className="modal-description__scroll">
                  <p className="modal-description__eyebrow">Property overview</p>
                  <div className="modal-description__rule" aria-hidden />
                  <ModalDescriptionBody description={selected.description} />
                </div>
                {selected.slug ? (
                  <div className="modal-description__actions">
                    <Link
                      to={`/properties/${selected.slug}`}
                      className="btn btn-gold modal-description__cta"
                      onClick={() => setSelected(null)}
                    >
                      <span className="modal-description__cta-inner">
                        <span className="modal-description__cta-label">View full listing</span>
                      </span>
                    </Link>
                  </div>
                ) : null}
              </div>
            </MotionDiv>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )

  return (
    <div className={cn('modal-cards-container', className)}>
      <div className="modal-cards-grid">
        {cards.map((card) => {
          const priceLabel = formatCardPrice(card.price, card.status)
          return (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            className="modal-card"
            onClick={() => setSelected(card)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelected(card)
              }
            }}
          >
            <img className="modal-card-image" src={card.imageUrl} alt={card.title} loading="lazy" />
            <div className="modal-card-overlay">
              <div className="modal-card-content">
                <div className="modal-card-copy">
                  <h3 className="modal-card-title">{card.title}</h3>
                  {priceLabel ? <p className="modal-card-price">{priceLabel}</p> : null}
                </div>
                <span className="modal-card-icon" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3V13M3 8H13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          )
        })}
      </div>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </div>
  )
}
