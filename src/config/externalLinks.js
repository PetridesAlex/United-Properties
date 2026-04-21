/**
 * Hosted Sanity Studio (Portal — team login).
 * Use the direct studio host URL to avoid browser phishing heuristics on long encoded auth links.
 * Set `VITE_SANITY_STUDIO_URL` in `.env` to override without code changes.
 */
export const SANITY_STUDIO_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SANITY_STUDIO_URL
    ? String(import.meta.env.VITE_SANITY_STUDIO_URL)
    : 'https://unitedproperties-eu.sanity.studio/'

/** Quick chat links (navbar + footer). Override in `.env` with VITE_* if needed. */
export const WHATSAPP_CHAT_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_URL
    ? String(import.meta.env.VITE_WHATSAPP_URL)
    : 'https://wa.me/35700000000'

export const TELEGRAM_CHAT_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_URL
    ? String(import.meta.env.VITE_TELEGRAM_URL)
    : 'https://t.me/'

/** Primary inbox for quick-contact FAB + footer (override with VITE_CONTACT_EMAIL). */
export const CONTACT_EMAIL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_EMAIL
    ? String(import.meta.env.VITE_CONTACT_EMAIL)
    : 'info@unitedproperties.eu'

export const CONTACT_MAILTO_HREF = `mailto:${CONTACT_EMAIL}`

/** Primary phone for tel: links (FAB + quick actions). Full `tel:` URI, e.g. tel:+35725123456 */
export const CONTACT_PHONE_TEL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_PHONE_TEL
    ? String(import.meta.env.VITE_CONTACT_PHONE_TEL)
    : 'tel:+35725123456'
