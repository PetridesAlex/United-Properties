import { useEffect, useState } from 'react'
import './CookiePreferences.css'

const STORAGE_KEY = 'united-properties-cookie-preferences-v1'
export const OPEN_COOKIE_SETTINGS_EVENT = 'up:open-cookie-settings'

const defaults = { necessary: true, analytics: false, marketing: false }

function readSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics ?? parsed.performance),
      marketing: Boolean(parsed.marketing),
    }
  } catch {
    return null
  }
}

function Toggle({ on, locked, label, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked}
      className={`ck-tg${on ? ' is-on' : ''}${locked ? ' is-locked' : ''}`}
      onClick={() => onChange(!on)}
    />
  )
}

/** Compact cookie card (bottom left). No floating button: the footer "Cookie settings" link reopens the panel. */
function CookiePreferences() {
  const [view, setView] = useState('closed') // 'banner' | 'settings' | 'closed'
  const [prefs, setPrefs] = useState(defaults)

  useEffect(() => {
    const saved = readSaved()
    if (saved) setPrefs(saved)
    else setView('banner')
  }, [])

  useEffect(() => {
    const open = () => {
      const saved = readSaved()
      if (saved) setPrefs(saved)
      setView('settings')
    }
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open)
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open)
  }, [])

  function save(next) {
    const value = { ...next, necessary: true }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...value, functional: value.analytics, performance: value.analytics }),
      )
    } catch {
      /* storage can be unavailable */
    }
    setPrefs(value)
    setView('closed')
  }

  if (view === 'closed') return null

  if (view === 'banner') {
    return (
      <div className="ck" role="dialog" aria-label="Cookies">
        <span className="ck__lb">COOKIES</span>
        <p>We use cookies to make the site work and to understand how it is used. You choose which ones to allow.</p>
        <div className="ck__btns">
          <button type="button" className="ck__bt ck__bt--pri" onClick={() => save({ necessary: true, analytics: true, marketing: true })}>
            Accept
          </button>
          <button type="button" className="ck__bt ck__bt--out" onClick={() => save(defaults)}>
            Decline
          </button>
          <button type="button" className="ck__bt ck__bt--txt" onClick={() => setView('settings')}>
            <span>Settings</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ck ck--panel" role="dialog" aria-label="Cookie settings">
      <h3>Cookie settings</h3>
      <div className="ck__row">
        <div>
          <b>Necessary</b>
          <span>Needed for the site to work. Always on.</span>
        </div>
        <Toggle on locked label="Necessary cookies" />
      </div>
      <div className="ck__row">
        <div>
          <b>Analytics</b>
          <span>Helps us understand how the site is used.</span>
        </div>
        <Toggle on={prefs.analytics} label="Analytics cookies" onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))} />
      </div>
      <div className="ck__row">
        <div>
          <b>Marketing</b>
          <span>Used to show relevant content elsewhere.</span>
        </div>
        <Toggle on={prefs.marketing} label="Marketing cookies" onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))} />
      </div>
      <div className="ck__btns ck__btns--panel">
        <button type="button" className="ck__bt ck__bt--pri" onClick={() => save(prefs)}>
          Save choices
        </button>
        <button type="button" className="ck__bt ck__bt--out" onClick={() => save({ necessary: true, analytics: true, marketing: true })}>
          Accept all
        </button>
      </div>
    </div>
  )
}

export default CookiePreferences
