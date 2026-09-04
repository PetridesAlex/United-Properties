import {useEffect, useId, useRef, useState} from 'react'
import {Check, Copy, FileDown, Loader2, Share2} from 'lucide-react'
import toast from 'react-hot-toast'
import {WHATSAPP_CHAT_URL} from '../../config/externalLinks'
import {downloadPropertyPdf} from '../../lib/properties/downloadPropertyPdf'
import {WhatsAppBrandIcon} from '../Navbar/SocialBrandIcons'
import './PropertyShareMenu.css'

export default function PropertyShareMenu({
  property,
  whatsappLabel = 'Chat on WhatsApp',
  pdfLabel = 'Download PDF',
}) {
  const menuId = useId()
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copyLink() {
    const url = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const input = document.createElement('input')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      toast.success('Link copied')
      setOpen(false)
    } catch {
      toast.error('Could not copy link')
    }
  }

  async function shareNative() {
    const url = window.location.href
    const title = property?.title || 'United Properties listing'
    if (navigator.share) {
      try {
        await navigator.share({title, text: title, url})
        setOpen(false)
        return
      } catch (error) {
        if (error?.name === 'AbortError') return
      }
    }
    await copyLink()
  }

  function onDownloadPdf() {
    if (pdfBusy || !property) return
    setPdfBusy(true)
    try {
      downloadPropertyPdf(property)
      toast.success('Choose “Save as PDF” in the print dialog')
    } catch (error) {
      toast.error(error?.message || 'Could not open PDF sheet')
    } finally {
      window.setTimeout(() => setPdfBusy(false), 900)
    }
  }

  const whatsappHref = buildWhatsAppHref(property)

  return (
    <div className="property-actions" ref={rootRef}>
      <div className={`property-share${open ? ' is-open' : ''}`}>
        <button
          type="button"
          className="property-action property-action--share"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="property-action__icon" aria-hidden>
            <Share2 size={15} strokeWidth={2.15} />
          </span>
          <span className="property-action__label">Share</span>
          <span className="property-action__shine" aria-hidden />
        </button>

        {open ? (
          <div className="property-share__menu" id={menuId} role="menu" aria-label="Share listing">
            <button type="button" className="property-share__item" role="menuitem" onClick={() => void shareNative()}>
              <Share2 size={15} strokeWidth={2.1} aria-hidden />
              <span>Share listing</span>
            </button>
            <button type="button" className="property-share__item" role="menuitem" onClick={() => void copyLink()}>
              {copied ? <Check size={15} strokeWidth={2.2} aria-hidden /> : <Copy size={15} strokeWidth={2.1} aria-hidden />}
              <span>{copied ? 'Copied' : 'Copy link'}</span>
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className={`property-action property-action--pdf${pdfBusy ? ' is-busy' : ''}`}
        onClick={onDownloadPdf}
        disabled={pdfBusy}
        aria-busy={pdfBusy}
        aria-label="Download this property as PDF"
      >
        <span className="property-action__icon" aria-hidden>
          {pdfBusy ? <Loader2 size={15} strokeWidth={2.2} className="property-action__spin" /> : <FileDown size={15} strokeWidth={2.15} />}
        </span>
        <span className="property-action__label">
          {pdfBusy ? 'Preparing…' : pdfLabel}
        </span>
        <span className="property-action__shine" aria-hidden />
      </button>

      <a
        className="property-action property-action--whatsapp"
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label={whatsappLabel}
      >
        <span className="property-action__icon property-action__icon--wa" aria-hidden>
          <span className="property-action__pulse" />
          <WhatsAppBrandIcon size={15} />
        </span>
        <span className="property-action__copy">
          <span className="property-action__label">{whatsappLabel}</span>
          <span className="property-action__hint">Live chat</span>
        </span>
        <span className="property-action__shine" aria-hidden />
      </a>
    </div>
  )
}

function buildWhatsAppHref(property) {
  const base = String(WHATSAPP_CHAT_URL || 'https://wa.me/35700000000').replace(/\?.*$/, '')
  const title = property?.title ? String(property.title).trim() : 'this listing'
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const text = [`Hi, I'm interested in ${title}.`, url].filter(Boolean).join('\n')
  return `${base}?text=${encodeURIComponent(text)}`
}
