import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_MAILTO_HREF } from '../../config/externalLinks'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'

/**
 * "Request a private consultation" card (approved): the button opens the form inline,
 * without moving the page. Name and surname + phone required; email and message optional;
 * ticking "company" makes the company name required and the personal name optional.
 */
export default function PrivateConsultation({ propertyId = null, propertyTitle = '', reference = '' }) {
  const [state, setState] = useState('closed') // closed | open | sent
  const [company, setCompany] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const firstRef = useRef(null)

  useEffect(() => {
    if (state === 'open') firstRef.current?.focus({ preventScroll: true })
  }, [state, company])

  async function onSubmit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    if (data.website) {
      setState('sent')
      return
    }
    const name = company
      ? [String(data.companyName || '').trim(), String(data.name || '').trim()].filter(Boolean).join(' / ')
      : String(data.name || '').trim()
    const message = [
      String(data.message || '').trim(),
      reference ? `Property reference: ${reference}` : '',
      company ? 'Enquiring as a company' : '',
    ]
      .filter(Boolean)
      .join('\n')
    setBusy(true)
    setError('')
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: dbError } = await supabase.from('inquiries').insert({
          full_name: name,
          email: String(data.email || '').trim(),
          phone: String(data.phone || '').trim() || null,
          subject: 'Private consultation',
          property_interest: propertyTitle || null,
          preferred_contact: null,
          message,
          source: 'website',
          status: 'new',
          property_id: propertyId || null,
        })
        if (!dbError) {
          setState('sent')
          return
        }
      }
      const body = [`Name: ${name}`, `Phone: ${data.phone || ''}`, `Email: ${data.email || ''}`, `Property: ${propertyTitle}`, '', message].join('\n')
      window.location.href = `${CONTACT_MAILTO_HREF}?subject=${encodeURIComponent('Private consultation')}&body=${encodeURIComponent(body)}`
      setState('sent')
    } catch {
      setError(`Could not send. Please email ${CONTACT_EMAIL}.`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`pp-eqc is-${state}`}>
      <span className="pp-ceb">PRIVATE INQUIRY</span>
      <h3>Request a private consultation</h3>
      {state === 'closed' ? (
        <>
          <p>Share a few details and we will respond with tailored guidance for your brief.</p>
          <div className="pp-eqc__cl">
            <div className="pp-eqc__ln">
              <span>Reply within one business day</span>
              <span>Your details stay confidential</span>
            </div>
            <button type="button" className="pp-btn pp-btn--wide" onClick={() => setState('open')}>
              Request a private consultation
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </>
      ) : null}

      {state === 'open' ? (
        <form className="pp-fm" onSubmit={onSubmit} noValidate={false}>
          <label className="pp-tg">
            <input type="checkbox" checked={company} onChange={(e) => setCompany(e.target.checked)} />
            <span className="pp-tg__box" aria-hidden />
            <span>I am enquiring as a company</span>
          </label>
          {company ? (
            <label className="pp-fld">
              <span className="pp-fl">COMPANY NAME</span>
              <input ref={firstRef} name="companyName" required placeholder="Your company name" />
            </label>
          ) : null}
          <label className="pp-fld">
            <span className="pp-fl">{company ? 'NAME AND SURNAME (OPTIONAL)' : 'NAME AND SURNAME'}</span>
            <input
              ref={company ? undefined : firstRef}
              name="name"
              required={!company}
              autoComplete="name"
              placeholder="Your name and surname"
            />
          </label>
          <label className="pp-fld">
            <span className="pp-fl">PHONE</span>
            <input name="phone" type="tel" required autoComplete="tel" placeholder="Your phone number" />
          </label>
          <label className="pp-fld">
            <span className="pp-fl">EMAIL (OPTIONAL)</span>
            <input name="email" type="email" autoComplete="email" placeholder="Your email address" />
          </label>
          <label className="pp-fld">
            <span className="pp-fl">MESSAGE (OPTIONAL)</span>
            <textarea name="message" rows={2} placeholder="Anything you would like us to know" />
          </label>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="pp-hp" aria-hidden />
          {reference ? (
            <div className="pp-ref">
              <span className="pp-fl">PROPERTY REFERENCE</span>
              <b>{reference}</b>
            </div>
          ) : null}
          <button type="submit" className="pp-btn pp-btn--wide" disabled={busy}>
            {busy ? 'Sending…' : 'Send request'}
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
          </button>
          {error ? <span className="pp-pv">{error}</span> : null}
        </form>
      ) : null}

      {state === 'sent' ? (
        <p className="pp-eqc__sent">Thank you. A consultant will be in touch shortly.</p>
      ) : null}
    </div>
  )
}
