import DOMPurify from 'dompurify'

/** Sanitize HTML before rendering CMS rich text on the public site. */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') return dirty
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}
