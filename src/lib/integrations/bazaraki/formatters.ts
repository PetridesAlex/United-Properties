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
