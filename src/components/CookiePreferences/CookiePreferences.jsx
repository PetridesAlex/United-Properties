import { useEffect, useMemo, useState } from 'react'
import { Cookie, X } from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import './CookiePreferences.css'

const STORAGE_KEY = 'united-properties-cookie-preferences-v1'

const defaultPreferences = {
  necessary: true,
  functional: true,
  analytics: true,
  performance: true,
}

function CookieToggle({ id, label, description, checked, disabled, onChange }) {
  return (
    <div className={`cookie-preferences__item ${checked ? 'is-active' : ''}`.trim()}>
      <div>
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <label className={`cookie-toggle ${disabled ? 'is-disabled' : ''}`} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span className="cookie-toggle__track" aria-hidden="true" />
        <span className="cookie-toggle__label" aria-hidden="true">
          {checked ? 'On' : 'Off'}
        </span>
      </label>
    </div>
  )
}

function CookiePreferences() {
  const { get } = useSiteContent()
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState(defaultPreferences)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const merged = {
          ...defaultPreferences,
          ...parsed,
          necessary: true,
        }
        merged.performance = merged.analytics
        setPreferences(merged)
      } catch {
        setPreferences(defaultPreferences)
      }
    } else {
      setOpen(true)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const hasSavedPreferences = useMemo(
    () => !!localStorage.getItem(STORAGE_KEY),
    [open],
  )

  function save(nextPreferences) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...nextPreferences,
        necessary: true,
      }),
    )
    setPreferences({
      ...nextPreferences,
      necessary: true,
    })
    setOpen(false)
  }

  function updatePreference(key, value) {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'analytics') {
        next.performance = value
      }
      return next
    })
  }

  const rejectOptional = () =>
    save({
      ...defaultPreferences,
      functional: false,
      analytics: false,
      performance: false,
    })

  const acceptAll = () =>
    save({
      ...defaultPreferences,
      functional: true,
      analytics: true,
      performance: true,
    })

  return (
    <>
      <button
        className="cookie-preferences__launcher"
        type="button"
        aria-label={get('cookies', 'modal', 'launcher_label', 'Cookie preferences')}
        onClick={() => setOpen(true)}
      >
        <Cookie size={18} strokeWidth={2} />
      </button>

      {open && (
        <div className="cookie-preferences__backdrop" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="cookie-preferences__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="cookie-preferences__header">
              <div>
                <p className="cookie-preferences__eyebrow">{get('cookies', 'modal', 'eyebrow', 'Privacy')}</p>
                <h2 id="cookie-title">{get('cookies', 'modal', 'heading', 'Cookies')}</h2>
              </div>
              <button type="button" className="cookie-preferences__close" aria-label={get('cookies', 'modal', 'close_label', 'Close')} onClick={() => setOpen(false)}>
                <X size={18} strokeWidth={2} />
              </button>
            </header>

            <p className="cookie-preferences__lead">
              {get(
                'cookies',
                'modal',
                'lead',
                'We use cookies to run the site securely and, with your consent, to improve your experience.',
              )}
            </p>

            <div className="cookie-preferences__quick">
              <button type="button" className="cookie-preferences__btn cookie-preferences__btn--gold" onClick={acceptAll}>
                {get('cookies', 'modal', 'accept', 'Accept all')}
              </button>
              <button type="button" className="cookie-preferences__btn cookie-preferences__btn--muted" onClick={rejectOptional}>
                {get('cookies', 'modal', 'essential', 'Essential only')}
              </button>
            </div>

            <details className="cookie-preferences__details">
              <summary className="cookie-preferences__summary">
                {get('cookies', 'modal', 'customize', 'Customize categories')}
              </summary>
              <div className="cookie-preferences__list">
                <CookieToggle
                  id="necessary-cookies"
                  label={get('cookies', 'categories', 'necessary_title', 'Strictly necessary')}
                  description={get(
                    'cookies',
                    'categories',
                    'necessary_body',
                    'Security, navigation, and core features — always on.',
                  )}
                  checked
                  disabled
                />
                <CookieToggle
                  id="functional-cookies"
                  label={get('cookies', 'categories', 'functional_title', 'Functional')}
                  description={get(
                    'cookies',
                    'categories',
                    'functional_body',
                    'Saves preferences and improves usability.',
                  )}
                  checked={preferences.functional}
                  onChange={(value) => updatePreference('functional', value)}
                />
                <CookieToggle
                  id="analytics-cookies"
                  label={get('cookies', 'categories', 'analytics_title', 'Analytics & performance')}
                  description={get(
                    'cookies',
                    'categories',
                    'analytics_body',
                    'Helps us measure traffic, speed, and improve the site.',
                  )}
                  checked={preferences.analytics}
                  onChange={(value) => updatePreference('analytics', value)}
                />
              </div>
              <button type="button" className="cookie-preferences__apply" onClick={() => save(preferences)}>
                {get('cookies', 'modal', 'save', 'Save choices')}
              </button>
            </details>

            {!hasSavedPreferences ? (
              <p className="cookie-preferences__hint">
                {get(
                  'cookies',
                  'modal',
                  'hint',
                  'Saved on this device. Change anytime via the cookie icon.',
                )}
              </p>
            ) : null}
          </section>
        </div>
      )}
    </>
  )
}

export default CookiePreferences
