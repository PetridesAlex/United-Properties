import { useEffect, useState } from 'react'
import {
  CONTACT_MAILTO_HREF,
  CONTACT_PHONE_TEL,
  TELEGRAM_CHAT_URL,
  WHATSAPP_CHAT_URL,
} from '../config/externalLinks'
import './UnitedContact.css'

function useNavbarOffset() {
  const [top, setTop] = useState(0)

  useEffect(() => {
    function measure() {
      const nav = document.querySelector('header.navbar')
      const next = nav ? Math.round(nav.getBoundingClientRect().height) : 0
      setTop((prev) => (prev === next ? prev : next))
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [])

  return top
}

const CONTACTS = [
  {
    key: 'call',
    title: 'Call',
    text: '+357 96178188',
    href: CONTACT_PHONE_TEL,
    external: false,
    icon: (
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    ),
  },
  {
    key: 'whatsapp',
    color: '#25D366',
    title: 'WhatsApp',
    text: '+357 96178188',
    href: WHATSAPP_CHAT_URL,
    external: true,
    icon: (
      <>
        <path d="M3.2 20.8l1.5-4.6A8.7 8.7 0 1 1 8 19.4z" />
        <path d="M9.2 8.3c-.4.9-.2 2.3 1.4 4s3.2 2.1 4.1 1.7l.9-1.2-1.9-1-.8.7c-.8-.3-1.8-1.3-2.1-2.1l.7-.8-1-1.9z" />
      </>
    ),
  },
  {
    key: 'telegram',
    color: '#2AA3EA',
    title: 'Telegram',
    text: '+357 96178188',
    href: TELEGRAM_CHAT_URL,
    external: true,
    icon: (
      <>
        <path d="M21 4L3 11l6 2.2L11 20l3-4.2L19 20z" />
        <path d="M9 13.2L21 4" />
      </>
    ),
  },
  {
    key: 'email',
    title: 'Email',
    text: 'info@unitedproperties.eu',
    href: CONTACT_MAILTO_HREF,
    external: false,
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3.5 7l8.5 6 8.5-6" />
      </>
    ),
  },
]

function Icon({ children, color = '#8C6640' }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export default function UnitedContact({ quizHref = '#' }) {
  const topOffset = useNavbarOffset()

  return (
    <div className="up-contact" style={{ '--up-top': `${topOffset}px` }}>
      <section className="ct-hero">
        <div>
          <span className="lbl">CONTACT</span>
          <h1>
            <span className="bw" style={{ animationDelay: '0.05s' }}>
              Start
            </span>
            <span className="bw" style={{ animationDelay: '0.15s' }}>
              with
            </span>
            <span className="bw" style={{ animationDelay: '0.25s' }}>
              a
            </span>
            <span className="bw" style={{ animationDelay: '0.35s' }}>
              conversation.
            </span>
          </h1>
          <p className="lead fc">Tell us what you have in mind. A consultant will be glad to hear it.</p>
        </div>
      </section>

      <section className="hl">
        <div>
          <span className="eb">UNITED PROPERTIES</span>
          <h2 className="tt">Get in touch</h2>
          <p className="tp">Choose the way that suits you best.</p>
          <div className="rule" />
          <div className="chg">
            {CONTACTS.map((c) => (
              <a
                key={c.key}
                className="chc"
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <div className="chi">
                  <Icon color={c.color}>{c.icon}</Icon>
                </div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </a>
            ))}
          </div>
          <div className="off">
            <div className="ofr">
              <div className="chi s">
                <Icon>
                  <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21z" />
                  <circle cx="12" cy="10" r="2.5" />
                </Icon>
              </div>
              <p>John F. Kennedy 8, Neapolis, Limassol, Cyprus</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-close">
        <div className="cta">
          <span className="lbl">UNITED PROPERTIES</span>
          <h2 className="tt">Tell us what you&apos;re looking for.</h2>
          <div className="bt">
            <a className="cb" href={quizHref}>
              Answer a few questions
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
