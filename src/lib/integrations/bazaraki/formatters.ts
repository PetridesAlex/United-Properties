export function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Strip HTML tags and escape for Bazaraki description (plain text, max 10k). */
export function escapeBazarakiDescription(text: string | null | undefined): string {
  if (!text?.trim()) return ''
  const plain = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return escapeXml(plain.slice(0, 10000))
}

/** Clean title: text/digits, no double spaces/commas, max 70 chars. */
export function formatBazarakiTitle(title: string | null | undefined): string {
  if (!title?.trim()) return ''
  let cleaned = title
    .replace(/[^\p{L}\p{N}\s.,+\-]/gu, ' ')
    .replace(/\s*,\s*(?:,\s*)+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+|\s+$/g, '')
  if (cleaned.length > 70) {
    cleaned = cleaned.slice(0, 70).replace(/\s+\S*$/, '').trim()
  }
  return cleaned
}

export function formatBazarakiPrice(price: number | null | undefined): string {
  const n = Number(price)
  if (!Number.isFinite(n) || n <= 0) return '0.00'
  return n.toFixed(2)
}

/**
 * Bazaraki "Reference number" = external_id.
 * Prefer a stable 7-digit code from our CMS reference (never the UUID).
 * Legacy UP-0001 → 1000001.
 */
export function toBazarakiExternalId(
  referenceNumber: string | null | undefined,
  fallbackId: string,
): string {
  const ref = referenceNumber?.trim() ?? ''

  if (/^\d{7}$/.test(ref)) return ref

  const up = /^UP-0*(\d+)$/i.exec(ref)
  if (up) {
    const n = Number(up[1])
    if (Number.isFinite(n) && n > 0) {
      return String(1_000_000 + n)
    }
  }

  const digits = ref.replace(/\D/g, '')
  if (digits.length >= 7) return digits.slice(-7)
  if (digits.length > 0) return digits.padStart(7, '0')

  const hex = fallbackId.replace(/-/g, '').replace(/\D/g, '') || fallbackId.replace(/-/g, '')
  const parsed = Number.parseInt(hex.slice(0, 8), 16)
  if (Number.isFinite(parsed)) {
    return String((Math.abs(parsed) % 9_000_000) + 1_000_000)
  }

  return '1000001'
}

/** Format as yyyy-mm-dd h:m:s (Bazaraki last_update). */
export function formatLastUpdate(isoDate: string | null | undefined): string {
  const d = isoDate ? new Date(isoDate) : new Date()
  if (Number.isNaN(d.getTime())) return formatLastUpdate(new Date().toISOString())

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${d.getHours()}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function extractWhatsappNumber(url: string | null | undefined): string {
  if (!url?.trim()) return ''
  const digits = url.replace(/\D/g, '')
  if (digits.startsWith('357') && digits.length >= 11) return digits
  if (digits.length >= 8) return digits
  return ''
}
