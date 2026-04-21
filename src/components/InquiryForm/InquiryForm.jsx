import {useState} from 'react'
import {Clock, Lock, Send, Sparkles} from 'lucide-react'
import './InquiryForm.css'

function InquiryForm({ className = '' }) {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState({type: '', message: ''})

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    setSubmitting(true)
    setResult({type: '', message: ''})

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Could not send inquiry')
      }

      form.reset()
      setResult({
        type: 'success',
        message: 'Inquiry sent. Our team will contact you shortly.',
      })
    } catch (error) {
      setResult({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not send inquiry. Please try again.',
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
          <Sparkles size={15} strokeWidth={2.2} aria-hidden />
          Priority access
        </span>
        <h3 className="inquiry-form__title">Request a private consultation</h3>
        <p className="inquiry-form__lede">
          Share your details and a dedicated advisor will contact you — usually within one business day.
        </p>
        <ul className="inquiry-form__trust" aria-label="What to expect">
          <li>
            <Clock size={15} strokeWidth={2} aria-hidden />
            Fast reply
          </li>
          <li>
            <Lock size={15} strokeWidth={2} aria-hidden />
            Confidential
          </li>
        </ul>
      </header>

      <div className="inquiry-form__fields">
        <div className="inquiry-form__grid">
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Full name</span>
            <input type="text" name="fullName" autoComplete="name" required placeholder="Your name" disabled={submitting} />
          </label>
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Email</span>
            <input type="email" name="email" autoComplete="email" required placeholder="you@example.com" disabled={submitting} />
          </label>
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Phone</span>
            <input type="tel" name="phone" autoComplete="tel" required placeholder="+357 …" disabled={submitting} />
          </label>
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Subject</span>
            <input type="text" name="subject" required placeholder="e.g. Viewing, offer, questions" disabled={submitting} />
          </label>
          <label className="inquiry-form__field inquiry-form__field--full">
            <span className="inquiry-form__label">Interested property <span className="inquiry-form__optional">(optional)</span></span>
            <input type="text" name="property" placeholder="Address or reference" disabled={submitting} />
          </label>
          <label className="inquiry-form__field">
            <span className="inquiry-form__label">Preferred contact</span>
            <select name="preferredContact" defaultValue="Email" disabled={submitting}>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </label>
        </div>

        {/* Honeypot: must stay empty */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="inquiry-form__honeypot"
          aria-hidden="true"
        />

        <label className="inquiry-form__field inquiry-form__field--full">
          <span className="inquiry-form__label">Message</span>
          <textarea
            name="message"
            rows={4}
            required
            placeholder="Tell us what you need — viewing times, budget, or questions about this listing."
            disabled={submitting}
          />
        </label>

        <button type="submit" className="inquiry-form__submit" disabled={submitting}>
          <Send size={18} strokeWidth={2.25} aria-hidden />
          <span>{submitting ? 'Sending…' : 'Send inquiry'}</span>
        </button>
        {result.message ? (
          <p
            className={`inquiry-form__status inquiry-form__status--${result.type || 'info'}`}
            role={result.type === 'error' ? 'alert' : 'status'}
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
