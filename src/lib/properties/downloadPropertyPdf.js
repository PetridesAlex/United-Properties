/**
 * Opens a premium one-page property sheet and triggers the browser print dialog
 * so the user can Save as PDF. Scoped to the property the user clicked.
 */
export function downloadPropertyPdf(property) {
  if (!property || typeof window === 'undefined') return

  const title = escapeHtml(property.title || 'Property')
  const location = escapeHtml(property.location || [property.area, property.city].filter(Boolean).join(', ') || '')
  const status = escapeHtml(property.status || '')
  const price = formatPrice(property)
  const facts = buildFacts(property)
  const amenities = buildAmenities(property)
  const description = escapeHtml(trimText(String(property.description || ''), 900))
  const image = Array.isArray(property.gallery) ? property.gallery.find(Boolean) : null
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const filenameHint = slugify(property.title || 'united-properties-listing')
  const refCode = escapeHtml(property.ref || property.reference || property.slug || '')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title} — United Properties</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #11223a;
      font-family: Montserrat, "Segoe UI", Helvetica, Arial, sans-serif;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      max-width: 760px;
      margin: 0 auto;
    }
    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(191, 152, 117, 0.45);
      margin-bottom: 18px;
    }
    .brand {
      font-size: 13px;
      font-weight: 750;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #11223a;
    }
    .brand span {
      color: #bf9875;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid rgba(191, 152, 117, 0.5);
      background: rgba(191, 152, 117, 0.12);
      color: #7a5a35;
      font-size: 10px;
      font-weight: 750;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .hero {
      width: 100%;
      height: 280px;
      object-fit: cover;
      object-position: center;
      border-radius: 14px;
      margin-bottom: 18px;
      background: #ece7df;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 26px;
      line-height: 1.15;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    .location {
      margin: 0 0 12px;
      color: rgba(17, 34, 58, 0.62);
      font-size: 13px;
    }
    .price {
      margin: 0 0 14px;
      font-size: 28px;
      font-weight: 750;
      letter-spacing: -0.02em;
      color: #11223a;
    }
    .price em {
      font-style: normal;
      font-size: 0.48em;
      letter-spacing: 0.1em;
      color: #bf9875;
      margin-right: 6px;
      vertical-align: 0.18em;
    }
    .facts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 0;
      margin: 0 0 18px;
      padding: 0;
      list-style: none;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(17, 34, 58, 0.78);
    }
    .facts li:not(:last-child)::after {
      content: "•";
      margin: 0 10px;
      color: #bf9875;
    }
    .section-label {
      margin: 0 0 6px;
      font-size: 10px;
      font-weight: 750;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #bf9875;
    }
    .description {
      margin: 0 0 18px;
      font-size: 12.5px;
      line-height: 1.55;
      color: rgba(17, 34, 58, 0.82);
      white-space: pre-wrap;
    }
    .amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0 0 22px;
      padding: 0;
      list-style: none;
    }
    .amenities li {
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid rgba(191, 152, 117, 0.35);
      background: rgba(191, 152, 117, 0.08);
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0.04em;
      color: rgba(17, 34, 58, 0.78);
    }
    .footer {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding-top: 14px;
      border-top: 1px solid rgba(191, 152, 117, 0.35);
      font-size: 10px;
      color: rgba(17, 34, 58, 0.55);
    }
    .footer a { color: #11223a; text-decoration: none; }
    @media print {
      .hero { height: 240px; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div class="brand">United <span>Properties</span></div>
      ${status ? `<div class="badge">${status}</div>` : ''}
    </div>
    ${image ? `<img class="hero" src="${escapeAttr(image)}" alt="" />` : ''}
    <h1>${title}</h1>
    ${location ? `<p class="location">${location}${refCode ? ` · Ref ${refCode}` : ''}</p>` : refCode ? `<p class="location">Ref ${refCode}</p>` : ''}
    ${price ? `<p class="price"><em>EUR</em>${escapeHtml(price)}</p>` : ''}
    ${facts.length ? `<ul class="facts">${facts.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
    ${description ? `<p class="section-label">Overview</p><p class="description">${description}</p>` : ''}
    ${amenities.length ? `<p class="section-label">Amenities</p><ul class="amenities">${amenities.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>` : ''}
    <div class="footer">
      <div>
        <div>United Signature listing</div>
        <div>info@unitedproperties.eu · +357 25 123 456</div>
      </div>
      <div style="text-align:right">
        <div>${escapeHtml(filenameHint)}.pdf</div>
        ${pageUrl ? `<a href="${escapeAttr(pageUrl)}">${escapeHtml(pageUrl)}</a>` : ''}
      </div>
    </div>
  </div>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 280);
    });
  </script>
</body>
</html>`

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100')
  if (!printWindow) {
    throw new Error('Pop-up blocked. Allow pop-ups to download the PDF.')
  }
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

function formatPrice(property) {
  const n = Number(property.price)
  if (!Number.isFinite(n)) return ''
  const base = n.toLocaleString('en-GB')
  if (property.status === 'For Rent') return `${base} / month`
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
    .slice(0, 16)
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;')
}
