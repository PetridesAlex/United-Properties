import {jsPDF} from 'jspdf'

/**
 * Build and download a clear, professional one-page property PDF.
 * Returns a Promise that resolves when the file save is triggered.
 */
export async function downloadPropertyPdf(property) {
  if (!property || typeof window === 'undefined') {
    throw new Error('Property data is not available.')
  }

  const title = String(property.title || 'Property').trim()
  const location = String(
    property.location || [property.area, property.city].filter(Boolean).join(', ') || '',
  ).trim()
  const status = String(property.status || '').trim()
  const price = formatPrice(property)
  const facts = buildFacts(property)
  const amenities = buildAmenities(property)
  const description = trimText(String(property.description || ''), 1100)
  const refCode = String(property.ref || property.reference || property.slug || '').trim()
  const pageUrl = window.location.href
  const filename = `${slugify(title || 'united-properties-listing')}.pdf`
  const imageUrl = resolveHeroImage(property)
  const logoUrl = new URL('/images/logo/United_Properties_v2.1.svg', window.location.origin).href

  const [logoImage, heroImage] = await Promise.all([
    loadImageForPdf(logoUrl, {preferPng: true}).catch(() => null),
    imageUrl ? loadImageForPdf(imageUrl).catch(() => null) : Promise.resolve(null),
  ])

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentW = pageW - margin * 2
  let y = margin

  // Brand bar with official logo + wordmark
  const headerH = 26
  doc.setFillColor(17, 34, 58)
  doc.rect(0, 0, pageW, headerH, 'F')
  doc.setFillColor(191, 152, 117)
  doc.rect(0, headerH, pageW, 1.2, 'F')

  let brandTextX = margin
  if (logoImage) {
    const logoH = 16
    const logoW = Math.min(34, logoH * (logoImage.width / Math.max(logoImage.height, 1)))
    const logoY = (headerH - logoH) / 2
    doc.addImage(logoImage.dataUrl, logoImage.format, margin, logoY, logoW, logoH, undefined, 'FAST')
    brandTextX = margin + logoW + 5
  }

  doc.setTextColor(255, 248, 239)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('UNITED PROPERTIES', brandTextX, 12.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(238, 211, 170)
  doc.text('Cyprus · Boutique real estate', brandTextX, 18.5)

  if (status) {
    const badge = status.toUpperCase()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    const badgeW = doc.getTextWidth(badge) + 8
    const badgeX = pageW - margin - badgeW
    doc.setFillColor(191, 152, 117)
    doc.roundedRect(badgeX, (headerH - 7) / 2, badgeW, 7, 1.5, 1.5, 'F')
    doc.setTextColor(17, 34, 58)
    doc.text(badge, badgeX + 4, headerH / 2 + 1.6)
  }

  y = headerH + 8

  // Hero image
  if (heroImage) {
    const imgH = 78
    doc.addImage(heroImage.dataUrl, heroImage.format, margin, y, contentW, imgH, undefined, 'FAST')
    y += imgH + 10
  } else {
    y += 2
  }

  // Title
  doc.setTextColor(17, 34, 58)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  const titleLines = doc.splitTextToSize(title.toUpperCase(), contentW)
  doc.text(titleLines, margin, y)
  y += titleLines.length * 7.2 + 2

  // Location + ref
  const metaBits = [location, refCode ? `Ref ${refCode}` : ''].filter(Boolean)
  if (metaBits.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(90, 104, 122)
    doc.text(metaBits.join('  ·  '), margin, y)
    y += 7
  }

  // Price
  if (price) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(191, 152, 117)
    doc.text('EUR', margin, y)
    const eurW = doc.getTextWidth('EUR ')
    doc.setFontSize(20)
    doc.setTextColor(17, 34, 58)
    doc.text(price, margin + eurW + 1, y)
    y += 10
  }

  // Facts row
  if (facts.length) {
    doc.setDrawColor(217, 182, 128)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(17, 34, 58)
    doc.text(facts.join('   ·   ').toUpperCase(), margin, y)
    y += 8
    doc.line(margin, y, pageW - margin, y)
    y += 8
  }

  // Overview
  if (description) {
    y = ensureSpace(doc, y, 28, pageH, margin)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(191, 152, 117)
    doc.text('OVERVIEW', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(40, 54, 72)
    const descLines = doc.splitTextToSize(description, contentW)
    for (const line of descLines) {
      y = ensureSpace(doc, y, 6, pageH, margin)
      doc.text(line, margin, y)
      y += 5
    }
    y += 5
  }

  // Amenities
  if (amenities.length) {
    y = ensureSpace(doc, y, 20, pageH, margin)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(191, 152, 117)
    doc.text('AMENITIES', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(40, 54, 72)

    const colGap = 6
    const colW = (contentW - colGap) / 2
    let col = 0
    let rowY = y
    let maxY = y

    for (const amenity of amenities) {
      const lines = doc.splitTextToSize(`•  ${amenity}`, colW - 2)
      const blockH = lines.length * 4.6
      if (rowY + blockH > pageH - 28) {
        doc.addPage()
        rowY = margin
        maxY = margin
      }
      const x = margin + col * (colW + colGap)
      doc.text(lines, x, rowY)
      maxY = Math.max(maxY, rowY + blockH)
      if (col === 0) {
        col = 1
      } else {
        col = 0
        rowY = maxY + 1.5
        maxY = rowY
      }
    }
    y = (col === 1 ? maxY : rowY) + 6
  }

  // Footer
  const footerY = pageH - 16
  doc.setDrawColor(217, 182, 128)
  doc.setLineWidth(0.35)
  doc.line(margin, footerY - 4, pageW - margin, footerY - 4)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(17, 34, 58)
  doc.text('United Properties', margin, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 104, 122)
  doc.text('info@unitedproperties.eu  ·  +357 96178188', margin, footerY + 4)
  doc.setFontSize(6.5)
  const urlLines = doc.splitTextToSize(pageUrl, contentW * 0.48)
  doc.text(urlLines, pageW - margin, footerY, {align: 'right'})

  doc.save(filename)
}

function ensureSpace(doc, y, needed, pageH, margin) {
  if (y + needed <= pageH - 22) return y
  doc.addPage()
  return margin
}

function resolveHeroImage(property) {
  if (Array.isArray(property.gallery)) {
    const fromGallery = property.gallery.find((src) => typeof src === 'string' && src.trim())
    if (fromGallery) return fromGallery.trim()
  }
  if (typeof property.image === 'string' && property.image.trim()) {
    return property.image.trim()
  }
  if (typeof property.coverImage === 'string' && property.coverImage.trim()) {
    return property.coverImage.trim()
  }
  return ''
}

async function loadImageForPdf(url, {preferPng = false} = {}) {
  const absolute = new URL(url, window.location.origin).href

  try {
    const raster = await imageUrlToRasterDataUrl(absolute, {preferPng})
    return raster
  } catch {
    const response = await fetch(absolute, {mode: 'cors', credentials: 'omit'})
    if (!response.ok) throw new Error('Image fetch failed')
    const blob = await response.blob()
    const dataUrl = await blobToDataUrl(blob)
    const format = detectImageFormat(blob.type, dataUrl)
    return {dataUrl, format, width: 1, height: 1}
  }
}

function imageUrlToRasterDataUrl(url, {preferPng = false} = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const maxW = preferPng ? 640 : 1600
        const naturalW = Math.max(img.naturalWidth || 1, 1)
        const naturalH = Math.max(img.naturalHeight || 1, 1)
        const scale = Math.min(1, maxW / naturalW)
        const width = Math.max(1, Math.round(naturalW * scale))
        const height = Math.max(1, Math.round(naturalH * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas unavailable'))
          return
        }
        if (preferPng) {
          ctx.clearRect(0, 0, width, height)
        } else {
          ctx.fillStyle = '#ece7df'
          ctx.fillRect(0, 0, width, height)
        }
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = preferPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.88)
        resolve({
          dataUrl,
          format: preferPng ? 'PNG' : 'JPEG',
          width: naturalW,
          height: naturalH,
        })
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = url
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(blob)
  })
}

function detectImageFormat(mime, dataUrl) {
  const type = String(mime || '').toLowerCase()
  if (type.includes('png') || dataUrl.startsWith('data:image/png')) return 'PNG'
  return 'JPEG'
}

function formatPrice(property) {
  const n = Number(property.price)
  if (!Number.isFinite(n)) return ''
  const base = n.toLocaleString('en-GB')
  if (String(property.status || '').toLowerCase().includes('rent')) {
    return `${base} / month`
  }
  return base
}

function buildFacts(property) {
  const facts = []
  if (property.bedrooms != null && property.bedrooms !== '') facts.push(`${property.bedrooms} Bedrooms`)
  if (property.bathrooms != null && property.bathrooms !== '') facts.push(`${property.bathrooms} Bathrooms`)
  if (property.sqm != null && property.sqm !== '') facts.push(`${property.sqm} sqm`)
  if (property.plotSize) facts.push(`${property.plotSize} sqm plot`)
  if (property.parking != null && property.parking !== '') facts.push(`${property.parking} Parking`)
  if (property.yearBuilt) facts.push(`Built ${property.yearBuilt}`)
  if (property.type) facts.push(String(property.type))
  return facts
}

function buildAmenities(property) {
  const list = Array.isArray(property.features)
    ? property.features
    : Array.isArray(property.amenities)
      ? property.amenities
      : []
  return list
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 18)
}

function trimText(value, max) {
  const text = value.replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}
