import { getSanityDataApiOrigin, SANITY_API_VERSION, SANITY_DATASET } from './sanityClient'

/**
 * Same anonymous GROQ as @sanity/client, via GET — works if the JS client fails in-browser.
 * Uses the same base URL as sanityClient (including dev proxy).
 */
export async function fetchSanityQueryOverHttp(query) {
  const compact = query.replace(/\s+/g, ' ').trim()
  const base = getSanityDataApiOrigin()
  const url = `${base}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(compact)}`
  let res
  try {
    res = await fetch(url)
  } catch (err) {
    const hint =
      err?.message === 'Failed to fetch'
        ? ' (likely CORS, bad network, or /sanity-api not proxied on this host)'
        : ''
    throw new Error(`Sanity fetch failed${hint}: ${err?.message || err}`, { cause: err })
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `Sanity HTTP ${res.status} ${res.statusText} at ${base}… — ${text.slice(0, 400)}`,
    )
  }
  const json = await res.json()
  if (json.error) {
    throw new Error(
      `${json.error.description || json.error.message || 'Sanity query error'} (dataset=${SANITY_DATASET})`,
    )
  }
  return json.result
}
