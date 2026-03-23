import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck, Cookie, X } from 'lucide-react'
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
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState(defaultPreferences)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPreferences({
          ...defaultPreferences,
          ...parsed,
          necessary: true,
        })
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
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <>
      <button
        className="cookie-preferences__launcher"
        type="button"
        aria-label="Customize cookie preferences"
        onClick={() => setOpen(true)}
      >
        <Cookie size={18} />
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
                <p>Privacy Center</p>
                <h3 id="cookie-title">Customize Consent Preferences</h3>
              </div>
              <button type="button" aria-label="Close preferences" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </header>

            <p className="cookie-preferences__intro">
              We use cookies to improve your browsing experience and provide tailored
              functionality. Choose your preferences below.
            </p>

            <div className="cookie-preferences__list">
              <CookieToggle
                id="necessary-cookies"
                label="Necessary"
                description="Essential cookies required for site security, routing, and core functionality."
                checked
                disabled
              />
              <CookieToggle
                id="functional-cookies"
                label="Functional"
                description="Enables enhanced usability such as saved preferences and personalized interactions."
                checked={preferences.functional}
                onChange={(value) => updatePreference('functional', value)}
              />
              <CookieToggle
                id="analytics-cookies"
                label="Analytics"
                description="Helps us understand visitor behavior and improve website performance."
                checked={preferences.analytics}
                onChange={(value) => updatePreference('analytics', value)}
              />
              <CookieToggle
                id="performance-cookies"
                label="Performance"
                description="Supports speed optimizations, feature stability, and smooth loading experiences."
                checked={preferences.performance}
                onChange={(value) => updatePreference('performance', value)}
              />
            </div>

            <footer className="cookie-preferences__actions">
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() =>
                  save({
                    ...defaultPreferences,
                    functional: false,
                    analytics: false,
                    performance: false,
                  })
                }
              >
                Reject All
              </button>
              <button type="button" className="btn btn-outline-dark" onClick={() => save(preferences)}>
                Save My Preferences
              </button>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() =>
                  save({
                    ...defaultPreferences,
                    functional: true,
                    analytics: true,
                    performance: true,
                  })
                }
              >
                <ShieldCheck size={16} />
                Accept All
              </button>
            </footer>

            {!hasSavedPreferences && (
              <p className="cookie-preferences__note">
                Your preferences will be saved locally and can be updated any time from
                the bottom-left button.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  )
}

export default CookiePreferences
