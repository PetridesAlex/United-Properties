/** Build /search URLs with optional filter seeds. */
export function buildSearchPath({
  query,
  city,
  category,
  bedrooms,
  minPrice,
  maxPrice,
} = {}) {
  const params = new URLSearchParams()
  const q = typeof query === 'string' ? query.trim() : ''
  if (q) params.set('q', q)
  if (city && city !== 'All Cyprus') params.set('city', city)
  if (category && category !== 'All Listings') {
    const type =
      category === 'Featured Properties' ||
      category === 'Signature Listings' ||
      category === 'Signature'
        ? 'Featured'
        : category
    params.set('type', type)
  }
  const beds = Number(bedrooms)
  if (Number.isFinite(beds) && beds > 0) params.set('beds', String(beds))
  const min = Number(minPrice)
  if (Number.isFinite(min) && min > 0) params.set('min', String(min))
  const max = Number(maxPrice)
  if (Number.isFinite(max) && max > 0) params.set('max', String(max))
  const qs = params.toString()
  return qs ? `/search?${qs}` : '/search'
}

export function normalizeSearchCategory(category) {
  if (!category || category === 'All Listings') return 'All Listings'
  if (category === 'Featured Properties' || category === 'Featured') return 'Featured'
  if (category === 'Signature Listings' || category === 'Signature') return 'Featured'
  if (category === 'For Sale' || category === 'For Rent') return category
  return 'All Listings'
}

export function parsePositiveInt(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.floor(n)
}

/** Price presets adapt to listing type so rent vs sale feel sane. */
export function pricePresetsForCategory(category) {
  if (category === 'For Rent') {
    return {
      min: [
        {value: 0, label: 'No min'},
        {value: 1000, label: 'EUR 1,000'},
        {value: 2000, label: 'EUR 2,000'},
        {value: 3500, label: 'EUR 3,500'},
        {value: 5000, label: 'EUR 5,000'},
        {value: 8000, label: 'EUR 8,000'},
      ],
      max: [
        {value: 0, label: 'No max'},
        {value: 2000, label: 'EUR 2,000'},
        {value: 3500, label: 'EUR 3,500'},
        {value: 5000, label: 'EUR 5,000'},
        {value: 8000, label: 'EUR 8,000'},
        {value: 15000, label: 'EUR 15,000'},
      ],
    }
  }

  return {
    min: [
      {value: 0, label: 'No min'},
      {value: 250000, label: 'EUR 250k'},
      {value: 500000, label: 'EUR 500k'},
      {value: 750000, label: 'EUR 750k'},
      {value: 1000000, label: 'EUR 1M'},
      {value: 2000000, label: 'EUR 2M'},
    ],
    max: [
      {value: 0, label: 'No max'},
      {value: 500000, label: 'EUR 500k'},
      {value: 1000000, label: 'EUR 1M'},
      {value: 2000000, label: 'EUR 2M'},
      {value: 3500000, label: 'EUR 3.5M'},
      {value: 5000000, label: 'EUR 5M'},
    ],
  }
}

export const BEDROOM_OPTIONS = [
  {value: 0, label: 'Any'},
  {value: 1, label: '1+'},
  {value: 2, label: '2+'},
  {value: 3, label: '3+'},
  {value: 4, label: '4+'},
]
