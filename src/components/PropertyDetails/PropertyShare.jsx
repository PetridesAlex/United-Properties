import { useState } from 'react'
import { Share2, Mail, Link2, FileDown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadPropertyPdf } from '../../lib/properties/downloadPropertyPdf'

/** One round Share button on the price line; opens to the left on hover or tap (approved). */
export default function PropertyShare({ property }) {
  const [busy, setBusy] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const title = property?.title || 'United Properties'
  const text = `${title}\n${url}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  async function pdf() {
    if (busy) return
    setBusy(true)
    try {
      await downloadPropertyPdf(property)
    } catch (error) {
      toast.error(error?.message || 'Could not download PDF')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pp-shr" tabIndex={0} aria-label="Share">
      <span className="pp-shr__opts">
        <a
          className="pp-so"
          title="WhatsApp"
          aria-label="Share on WhatsApp"
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366" aria-hidden>
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.79a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42" />
          </svg>
        </a>
        <a
          className="pp-so"
          title="Telegram"
          aria-label="Share on Telegram"
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2AA3EA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 4L3 11l6 2.2L11 20l3-4.2L19 20z" />
            <path d="M9 13.2L21 4" />
          </svg>
        </a>
        <a
          className="pp-so"
          title="Email"
          aria-label="Share by email"
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`}
        >
          <Mail size={18} strokeWidth={1.5} aria-hidden />
        </a>
        <button type="button" className="pp-so" title="Copy link" aria-label="Copy link" onClick={() => void copyLink()}>
          <Link2 size={18} strokeWidth={1.5} aria-hidden />
        </button>
        <button type="button" className="pp-so" title="Download PDF" aria-label="Download PDF" onClick={() => void pdf()} disabled={busy}>
          {busy ? <Loader2 size={18} strokeWidth={1.5} className="pp-spin" aria-hidden /> : <FileDown size={18} strokeWidth={1.5} aria-hidden />}
        </button>
      </span>
      <span className="pp-shi" title="Share">
        <Share2 size={18} strokeWidth={1.5} aria-hidden />
      </span>
    </div>
  )
}
