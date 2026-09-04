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
    document.documentElement.classList.toggle('cookie-consent-open', open)
    return () => {
      document.documentElement.classList.remove('cookie-consent-open')
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
      {!open ? (
        <button
          className="cookie-preferences__launcher"
          type="button"
          aria-label={get('cookies', 'modal', 'launcher_label', 'Cookie preferences')}
          onClick={() => setOpen(true)}
        >
          <Cookie size={18} strokeWidth={2} />
        </button>
      ) : null}

      {open ? (
        <div className="cookie-preferences__layer" role="presentation">
          <div
            className="cookie-preferences__scrim"
            aria-hidden
            onClick={() => {
              if (hasSavedPreferences) setOpen(false)
            }}
          />
          <section
            className="cookie-preferences__bar"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-title"
            data-cms-page="cookies"
            data-cms-section="modal"
          >
            <div className="cookie-preferences__accent" aria-hidden />
            <div className="cookie-preferences__shell">
              <div className="cookie-preferences__main">
                <div className="cookie-preferences__brand">
                  <div className="cookie-preferences__mark" aria-hidden>
                    <img
                      src="/images/logo/United_Properties_v2.1.svg"
                      alt=""
                      width={44}
                      height={44}
                    />
                  </div>
                  <div className="cookie-preferences__copy">
                    <p className="cookie-preferences__eyebrow">
                      {get('cookies', 'modal', 'eyebrow', 'United Properties')}
                    </p>
                    <h2 id="cookie-title">
                      {get('cookies', 'modal', 'heading', 'Your privacy, our standard')}
                    </h2>
                    <p className="cookie-preferences__lead">
                      {get(
                        'cookies',
                        'modal',
                        'lead',
                        'We use essential cookies to keep unitedproperties.eu secure, and optional ones only with your consent — so your browsing stays as refined as our homes.',
                      )}
                    </p>
                  </div>
                </div>

                <div className="cookie-preferences__actions">
                  {hasSavedPreferences ? (
                    <button
                      type="button"
                      className="cookie-preferences__close"
                      aria-label={get('cookies', 'modal', 'close_label', 'Close')}
                      onClick={() => setOpen(false)}
                    >
                      <X size={18} strokeWidth={2} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="cookie-preferences__btn cookie-preferences__btn--gold"
                    onClick={acceptAll}
                  >
                    {get('cookies', 'modal', 'accept', 'Accept all')}
                  </button>
                  <button
                    type="button"
                    className="cookie-preferences__btn cookie-preferences__btn--muted"
                    onClick={rejectOptional}
                  >
                    {get('cookies', 'modal', 'essential', 'Essential only')}
                  </button>
                </div>
              </div>

              <details className="cookie-preferences__details">
                <summary className="cookie-preferences__summary">
                  {get('cookies', 'modal', 'customize', 'Customize categories')}
                </summary>
                <div className="cookie-preferences__panel">
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
                      label={get(
                        'cookies',
                        'categories',
                        'analytics_title',
                        'Analytics & performance',
                      )}
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
                  <button
                    type="button"
                    className="cookie-preferences__apply"
                    onClick={() => save(preferences)}
                  >
                    {get('cookies', 'modal', 'save', 'Save choices')}
                  </button>
                </div>
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
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}

export default CookiePreferences
