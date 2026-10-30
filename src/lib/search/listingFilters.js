/**
 * Shared listing filter logic (Buy, Rent and Search use the same questions).
 * Lists of cities and areas only contain places where a property exists.
 */

export const EMPTY_FILTERS = {
  keyword: '',
  listing: '', // '' = any, 'For Sale', 'For Rent'
  type: '', // '' = all, 'apartments' | 'houses' | 'offices' | 'land'
  city: '',
  area: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  furnishing: '',
  condition: '',
  floor: '',
  airConditioning: '',
  landUse: '',
  minPlot: '',
  maxPlot: '',
}

export const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'apartments', label: 'Apartments' },
  { value: 'houses', label: 'Houses' },
  { value: 'offices', label: 'Offices' },
  { value: 'land', label: 'Land' },
]

export function typeGroup(property) {
  const t = String(property?.type || '').toLowerCase()
  if (/land|plot|field/.test(t)) return 'land'
  if (/office|commercial|shop|retail|warehouse|building/.test(t)) return 'offices'
  if (/house|villa|maisonette|townhouse|bungalow|detached/.test(t)) return 'houses'
  return 'apartments'
}

/** "Limassol - Germasogeia Tourist Area, Limassol" becomes "Germasogeia Tourist Area". */
export function areaOf(property) {
  const raw = String(property?.location || '').trim()
  if (!raw) return ''
  const first = raw.split(',')[0].trim()
  return first.replace(/^limassol\s*[-–]\s*/i, '').trim()
}

export function cityOf(property) {
  const raw = String(property?.location || '').trim()
  if (!raw) return ''
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean)
  const last = parts[parts.length - 1] || ''
  return last.replace(/^limassol\s*[-–]\s*/i, 'Limassol')
}

export function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

const FURNISHING_GROUP = (v) => {
  const s = String(v || '').toLowerCase()
  if (!s) return ''
  if (s.includes('semi')) return 'Semi'
  if (s.includes('unfurn')) return 'Unfurnished'
  if (s.includes('furn')) return 'Furnished'
  return ''
}

const CONDITION_GROUP = (v) => {
  const s = String(v || '').toLowerCase()
  if (s.includes('brand')) return 'Brand new'
  if (s.includes('resale')) return 'Resale'
  if (s.includes('construction')) return 'Under construction'
  return ''
}

function floorGroup(value) {
  if (value == null || value === '') return ''
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  if (n <= 0) return 'Ground'
  if (n >= 4) return '4+'
  return String(n)
}

export function matchesReference(property, keyword) {
  const digits = keyword.replace(/\D/g, '')
  return digits.length === 7 && String(property.referenceId || '').replace(/\D/g, '') === digits
}

export function applyListingFilters(properties, f) {
  const keyword = String(f.keyword || '').trim().toLowerCase()
  const exactRef = /^\d{7}$/.test(keyword.replace(/\s/g, ''))
  return properties.filter((p) => {
    if (f.listing && p.status !== f.listing) return false
    const group = typeGroup(p)
    if (f.type && group !== f.type) return false
    if (f.city && cityOf(p) !== f.city) return false
    if (f.area && areaOf(p) !== f.area) return false
    if (f.minPrice && Number(p.price) < Number(f.minPrice)) return false
    if (f.maxPrice && Number(p.price) > Number(f.maxPrice)) return false

    if (group === 'apartments' || group === 'houses') {
      if (f.bedrooms && Number(p.bedrooms) < Number(f.bedrooms)) return false
      if (f.bathrooms && Number(p.bathrooms) < Number(f.bathrooms)) return false
    }
    if (f.furnishing && FURNISHING_GROUP(p.furnishing) !== f.furnishing) return false
    if (f.condition && CONDITION_GROUP(p.condition) !== f.condition) return false
    if (f.floor && floorGroup(p.floor) !== f.floor) return false
    if (f.airConditioning === 'Yes' && !(Number(p.airConditioning) === 1 || Number(p.airConditioning) === 2)) {
      return false
    }
    if (group === 'land') {
      const plot = Number(p.plotSize || p.sqm || 0)
      if (f.minPlot && plot < Number(f.minPlot)) return false
      if (f.maxPlot && plot > Number(f.maxPlot)) return false
    }

    if (keyword) {
      if (exactRef) return matchesReference(p, keyword)
      const hay = [p.title, p.location, p.description, p.type, p.referenceId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!hay.includes(keyword)) return false
    }
    return true
  })
}

export function isFiltered(f, baseListing = '') {
  return Object.entries(f).some(([k, v]) => (k === 'listing' ? v !== baseListing : Boolean(v)))
}
