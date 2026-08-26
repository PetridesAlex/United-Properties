import {useState} from 'react'
import {Clock, Lock, Send, Sparkles} from 'lucide-react'
import {CONTACT_EMAIL, CONTACT_MAILTO_HREF} from '../../config/externalLinks'
import {isSupabaseConfigured, supabase} from '../../lib/supabaseClient'
import './InquiryForm.css'

function openMailtoFallback(payload) {
  const subject = encodeURIComponent(payload.subject?.trim() || 'United Properties inquiry')
  const body = encodeURIComponent(
    [
      `Name: ${payload.name || ''}`,
      `Email: ${payload.email || ''}`,
      `Phone: ${payload.phone || ''}`,
      `Preferred contact: ${payload.preferredContact || ''}`,
      `Interested property: ${payload.propertyInterest || '—'}`,
      '',
      payload.message || '',
    ].join('\n'),
  )
  window.location.href = `${CONTACT_MAILTO_HREF}?subject=${subject}&body=${body}`
}

function InquiryForm({ className = '' }) {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState({type: '', message: ''})

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    // Honeypot — bots fill this; treat as success without sending.
    if (payload.company) {
      form.reset()
      setResult({
        type: 'success',
        message: 'Inquiry sent. Our team will contact you shortly.',
      })
      return
    }

    setSubmitting(true)
    setResult({type: '', message: ''})

    try {
      if (isSupabaseConfigured && supabase) {
        const {error} = await supabase.from('inquiries').insert({
          full_name: String(payload.name || '').trim(),
          email: String(payload.email || '').trim(),
          phone: String(payload.phone || '').trim() || null,
          subject: String(payload.subject || '').trim() || null,
          property_interest: String(payload.propertyInterest || '').trim() || null,
          preferred_contact: String(payload.preferredContact || '').trim() || null,
          message: String(payload.message || '').trim(),
          source: 'website',
          status: 'new',
        })

        if (error) {
          console.warn('[InquiryForm] Supabase insert failed, falling back to mailto:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          })
          openMailtoFallback(payload)
          form.reset()
          setResult({
            type: 'success',
            message: `Could not save online — your email client should open so you can send this to ${CONTACT_EMAIL}.`,
          })
          return
        }

        form.reset()
        setResult({
          type: 'success',
          message: 'Inquiry sent. Our team will contact you shortly.',
        })
        return
      }

      openMailtoFallback(payload)
      form.reset()
      setResult({
        type: 'success',
        message: `Your email client should open so you can send this to ${CONTACT_EMAIL}.`,
      })
    } catch (error) {
      setResult({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not send your inquiry. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      className={`inquiry-form ${className}`.trim()}
      onSubmit={onSubmit}
      aria-label="Property inquiry form"
    >
      <header className="inquiry-form__header">
        <span className="inquiry-form__eyebrow">
          <Sparkles size={14} aria-hidden />
          Private inquiry
        </span>
        <h3 className="inquiry-form__title">Request a private consultation</h3>
        <p className="inquiry-form__lede">
          Share a few details and we will respond with tailored guidance for your brief.
        </p>
        <ul className="inquiry-form__trust" aria-label="What to expect">
          <li>
            <Clock size={14} aria-hidden />
            Reply within one business day
          </li>
          <li>
            <Lock size={14} aria-hidden />
            Your details stay confidential
          </li>
        </ul>
      </header>

      <div className="inquiry-form__fields">
        <div className="inquiry-form__grid">
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Full name</span>
            <input name="name" type="text" required autoComplete="name" />
          </label>
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Phone</span>
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Subject</span>
            <input name="subject" type="text" placeholder="Buying / renting / investment" />
          </label>
          <label className="inquiry-form__field inquiry-form__field--full">
            <span className="inquiry-form__label">
              Interested property <span className="inquiry-form__optional">(optional)</span>
            </span>
            <input name="propertyInterest" type="text" />
          </label>
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Preferred contact</span>
            <select name="preferredContact" defaultValue="email">
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
        </div>

        <input
          className="inquiry-form__honeypot"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <label className="inquiry-form__field inquiry-form__field--full">
          <span className="inquiry-form__label">Message</span>
          <textarea name="message" rows={5} required />
        </label>

        <button type="submit" className="inquiry-form__submit" disabled={submitting}>
          <Send size={16} aria-hidden />
          <span>{submitting ? 'Sending…' : 'Send inquiry'}</span>
        </button>

        {result.message ? (
          <p
            className={`inquiry-form__status inquiry-form__status--${result.type || 'info'}`}
            role="status"
          >
            {result.message}
          </p>
        ) : null}

        <p className="inquiry-form__footnote">No spam. We only use your details to respond to this request.</p>
      </div>
    </form>
  )
}

export default InquiryForm
