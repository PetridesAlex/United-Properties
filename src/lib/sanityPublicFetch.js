import { getSanityDataApiOrigin, SANITY_API_VERSION, SANITY_DATASET } from './sanityClient'

/**
 * Same anonymous GROQ as @sanity/client, via GET — works if the JS client fails in-browser.
 * Uses the same base URL as sanityClient (including dev proxy).
 */
export async function fetchSanityQueryOverHttp(query) {
  const compact = query.replace(/\s+/g, ' ').trim()
  const base = getSanityDataApiOrigin()
  const url = `${base}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(compact)}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Sanity HTTP ${res.status}: ${text.slice(0, 240)}`)
  }
  const json = await res.json()
  if (json.error) {
    throw new Error(json.error.description || json.error.message || 'Sanity query error')
  }
  return json.result
}
