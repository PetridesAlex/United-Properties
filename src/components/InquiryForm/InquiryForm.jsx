import {useEffect, useId, useRef, useState} from 'react'
import {ChevronDown, Clock, Lock, Send, Sparkles} from 'lucide-react'
import {CONTACT_EMAIL, CONTACT_MAILTO_HREF} from '../../config/externalLinks'
import {isSupabaseConfigured, supabase} from '../../lib/supabaseClient'
import {useSiteContent} from '../../hooks/useSiteContent'
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

function InquiryForm({
  className = '',
  propertyId = null,
  propertyInterestDefault = '',
  /** Property sidebar: premium CTA first, then expand the form. */
  revealOnClick = false,
}) {
  const {get} = useSiteContent()
  const fieldsId = useId()
  const firstFieldRef = useRef(null)
  const [open, setOpen] = useState(!revealOnClick)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState({type: '', message: ''})

  const heading = get('inquiry', 'form', 'heading', 'Request a private consultation')
  const successMessage = get(
    'inquiry',
    'form',
    'success',
    'Inquiry sent. Our team will contact you shortly.',
  )

  useEffect(() => {
    if (!revealOnClick || !open) return undefined
    const timer = window.setTimeout(() => {
      firstFieldRef.current?.focus({preventScroll: true})
    }, 280)
    return () => window.clearTimeout(timer)
  }, [open, revealOnClick])

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
        message: successMessage,
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
          property_id: propertyId || null,
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
          message: successMessage,
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

  const formClass = [
    'inquiry-form',
    revealOnClick ? 'inquiry-form--reveal' : '',
    revealOnClick && open ? 'is-open' : '',
    revealOnClick && !open ? 'is-collapsed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <form
      className={formClass}
      onSubmit={onSubmit}
      aria-label="Property inquiry form"
      data-open={revealOnClick ? (open ? 'true' : 'false') : undefined}
    >
      <header className="inquiry-form__header">
        <span className="inquiry-form__eyebrow">
          <Sparkles size={14} aria-hidden />
          {get('inquiry', 'form', 'eyebrow', 'Private inquiry')}
        </span>

        {revealOnClick ? (
          <>
            <p className="inquiry-form__invite" aria-hidden={!open}>
              Ready when you are
            </p>
            <h3 className="inquiry-form__title inquiry-form__title--animated">
              <span className="inquiry-form__title-shimmer">{heading}</span>
            </h3>
            <p className="inquiry-form__lede">
              {get(
                'inquiry',
                'form',
                'lede',
                'Share a few details and we will respond with tailored guidance for your brief.',
              )}
            </p>
            <ul className="inquiry-form__trust" aria-label="What to expect">
              <li>
                <Clock size={14} aria-hidden />
                {get('inquiry', 'form', 'trust1', 'Reply within one business day')}
              </li>
              <li>
                <Lock size={14} aria-hidden />
                {get('inquiry', 'form', 'trust2', 'Your details stay confidential')}
              </li>
            </ul>

            <button
              type="button"
              className="inquiry-form__reveal-btn"
              aria-expanded={open}
              aria-controls={fieldsId}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="inquiry-form__reveal-btn-glow" aria-hidden />
              <span className="inquiry-form__reveal-btn-label">
                {open ? 'Hide inquiry form' : heading}
              </span>
              <ChevronDown
                className="inquiry-form__reveal-btn-chevron"
                size={20}
                strokeWidth={2.2}
                aria-hidden
              />
            </button>
          </>
        ) : (
          <>
            <h3 className="inquiry-form__title">{heading}</h3>
            <p className="inquiry-form__lede">
              {get(
                'inquiry',
                'form',
                'lede',
                'Share a few details and we will respond with tailored guidance for your brief.',
              )}
            </p>
            <ul className="inquiry-form__trust" aria-label="What to expect">
              <li>
                <Clock size={14} aria-hidden />
                {get('inquiry', 'form', 'trust1', 'Reply within one business day')}
              </li>
              <li>
                <Lock size={14} aria-hidden />
                {get('inquiry', 'form', 'trust2', 'Your details stay confidential')}
              </li>
            </ul>
          </>
        )}
      </header>

      <div
        id={fieldsId}
        className="inquiry-form__fields"
        aria-hidden={revealOnClick && !open ? true : undefined}
      >
        <div className="inquiry-form__fields-inner">
          <div className="inquiry-form__grid">
            <label className="inquiry-form__field">
              <span className="inquiry-form__label">
                {get('inquiry', 'form', 'label_name', 'Full name')}
              </span>
              <input
                ref={firstFieldRef}
                name="name"
                type="text"
                required={open}
                autoComplete="name"
                tabIndex={revealOnClick && !open ? -1 : undefined}
              />
            </label>
            <label className="inquiry-form__field">
              <span className="inquiry-form__label">
                {get('inquiry', 'form', 'label_email', 'Email')}
              </span>
              <input
                name="email"
                type="email"
                required={open}
                autoComplete="email"
                tabIndex={revealOnClick && !open ? -1 : undefined}
              />
            </label>
            <label className="inquiry-form__field">
              <span className="inquiry-form__label">
                {get('inquiry', 'form', 'label_phone', 'Phone')}
              </span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                tabIndex={revealOnClick && !open ? -1 : undefined}
              />
            </label>
            <label className="inquiry-form__field">
              <span className="inquiry-form__label">
                {get('inquiry', 'form', 'label_subject', 'Subject')}
              </span>
              <input
                name="subject"
                type="text"
                placeholder={get(
                  'inquiry',
                  'form',
                  'placeholder_subject',
                  'Buying / renting / investment',
                )}
                tabIndex={revealOnClick && !open ? -1 : undefined}
              />
            </label>
            <label className="inquiry-form__field inquiry-form__field--full">
              <span className="inquiry-form__label">
                {get('inquiry', 'form', 'label_property', 'Interested property')}{' '}
                <span className="inquiry-form__optional">
                  {get('inquiry', 'form', 'optional', '(optional)')}
                </span>
              </span>
              <input
                name="propertyInterest"
                type="text"
                defaultValue={propertyInterestDefault}
                tabIndex={revealOnClick && !open ? -1 : undefined}
              />
            </label>
            <label className="inquiry-form__field">
              <span className="inquiry-form__label">
                {get('inquiry', 'form', 'label_preferred', 'Preferred contact')}
              </span>
              <select
                name="preferredContact"
                defaultValue="email"
                tabIndex={revealOnClick && !open ? -1 : undefined}
              >
                <option value="email">{get('inquiry', 'form', 'option_email', 'Email')}</option>
                <option value="phone">{get('inquiry', 'form', 'option_phone', 'Phone')}</option>
                <option value="whatsapp">
                  {get('inquiry', 'form', 'option_whatsapp', 'WhatsApp')}
                </option>
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
            <span className="inquiry-form__label">
              {get('inquiry', 'form', 'label_message', 'Message')}
            </span>
            <textarea
              name="message"
              rows={5}
              required={open}
              tabIndex={revealOnClick && !open ? -1 : undefined}
            />
          </label>

          <button
            type="submit"
            className="inquiry-form__submit"
            disabled={submitting || (revealOnClick && !open)}
            tabIndex={revealOnClick && !open ? -1 : undefined}
          >
            <Send size={16} aria-hidden />
            <span>
              {submitting
                ? get('inquiry', 'form', 'submitting', 'Sending…')
                : get('inquiry', 'form', 'submit', 'Send inquiry')}
            </span>
          </button>

          {result.message ? (
            <p
              className={`inquiry-form__status inquiry-form__status--${result.type || 'info'}`}
              role="status"
            >
              {result.message}
            </p>
          ) : null}

          <p className="inquiry-form__footnote">
            {get(
              'inquiry',
              'form',
              'footnote',
              'No spam. We only use your details to respond to this request.',
            )}
          </p>
        </div>
      </div>
    </form>
  )
}

export default InquiryForm
