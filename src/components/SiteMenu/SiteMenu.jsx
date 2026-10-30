import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { Instagram, Linkedin, X } from 'lucide-react'
import './SiteMenu.css'

/**
 * Approved menu (2026-10): full navy screen, logo top left, thin cream cross in a gold ring,
 * five Cormorant items with fine gold lines, only the four social icons at the bottom.
 * Fade-in only; no animation with prefers-reduced-motion.
 */
export default function SiteMenu({ items, socials }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('up-menu-open')
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('up-menu-open')
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        className="up-menu-btn"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>
      {typeof document !== 'undefined'
        ? createPortal(
            <div className={`up-menu${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open}>
              <div className="up-menu__top">
                <Link to="/" className="up-menu__logo" aria-label="United Properties, home" tabIndex={open ? 0 : -1}>
                  <img src="/images/logo/United_Properties_v2.1.svg" alt="" />
                </Link>
                <button type="button" className="up-menu__x" aria-label="Close menu" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                  <X size={17} strokeWidth={1.3} aria-hidden />
                </button>
              </div>
              <nav className="up-menu__nav" aria-label="Main navigation">
                {items.map((item) => (
                  <Link key={item.to} to={item.to} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="up-menu__bottom">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    className={`up-menu__so up-menu__so--${s.key}`}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    tabIndex={open ? 0 : -1}
                  >
                    {s.key === 'instagram' ? <Instagram size={18} strokeWidth={1.5} aria-hidden /> : null}
                    {s.key === 'linkedin' ? <Linkedin size={18} strokeWidth={1.5} aria-hidden /> : null}
                    {s.key === 'whatsapp' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.79a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42" />
                      </svg>
                    ) : null}
                    {s.key === 'telegram' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M21 4L3 11l6 2.2L11 20l3-4.2L19 20z" />
                        <path d="M9 13.2L21 4" />
                      </svg>
                    ) : null}
                  </a>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
